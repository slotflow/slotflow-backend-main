import { FilterQuery, Types } from "mongoose";
import { formatInTimeZone } from "date-fns-tz";
import { Role } from "../../domain/enums/common.enum";
import { BookingModel } from "../models/booking.model";
import { TableData } from "../../application/dtos/common.dto";
import { BookingProps } from "../../domain/contracts/booking.contract";
import { AppointmentStatus } from "../../domain/enums/appointmentStatus.enum";
import { formatStatMetric } from "../../shared/utils/helpers/formatStatMetric";
import { defaultTimezone } from "../../shared/utils/constants/constant";
import { getDateRangeMetrics, getDayBoundaryMetrics } from "../../shared/utils/helpers/getDateRangeMetrics";
import { IBookingQueries } from "../../application/interfaces/queries/IBooking.queries"
import { BookingDetailsQuery, BookingDetailsView, BookingGraphStatsForProviderQuery, BookingGraphStatsForProviderView, BookingsBaseView, BookingsQuery, BookingsStatsDataAdminQuery, BookingsStatsDataAdminView, BookingStatsForProviderQuery, BookingStatsForProviderView, BookingsView, BookingUsersForChatQuery, BookingUsersForChatView, OnlineBookingsViewForProvider, OnlineBookingsViewForUser } from "../../application/dtos/booking.dto";

const shiftDateOnly = (dateString: string, days: number): string => {
    const date = new Date(`${dateString}T00:00:00.000Z`);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
};

export class BookingQueriesImpl implements IBookingQueries {

    async findAll(query: BookingsQuery): Promise<TableData<BookingsView>> {

        const { page, limit, userId, serviceProviderId, online, role } = query;

        const skip = (page - 1) * limit;

        const filter: {
            userId?: Types.ObjectId,
            serviceProviderId?: Types.ObjectId
        } = {};

        if (userId) { filter.userId = new Types.ObjectId(userId) };
        if (serviceProviderId) { filter.serviceProviderId = new Types.ObjectId(serviceProviderId) };

        const rawProject: Record<string, number> = {
            _id: 1,
            appointmentDate: 1,
            appointmentMode: 1,
            videoCallRoomId: 1,
            appointmentStatus: 1,
            appointmentTime: 1,
            serviceProviderId: 1,
            createdAt: 1,
        }
        const onlineProject: Record<string, number> = {
            _id: 1,
            appointmentDate: 1,
            videoCallRoomId: 1,
            appointmentStatus: 1,
            appointmentTime: 1,
            createdAt: 1,
            username: 1,
        }

        const project = online ? onlineProject : rawProject;

        let dbquery = BookingModel.find(filter, project)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean<BookingsView>();

        if (online && role === Role.USER) {
            dbquery = dbquery.populate("serviceProviderId", "username -_id");
        } else if (online && role === Role.PROVIDER) {
            dbquery = dbquery.populate("userId", "username -_id");
        }

        const [bookings, totalCount] = await Promise.all([
            dbquery.exec(),
            BookingModel.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        if (online && role === Role.USER) {
            return {
                items: (bookings as OnlineBookingsViewForUser).map(booking => ({
                    ...booking,
                    _id: booking._id.toString(),
                    serviceProviderId: {
                        username: booking.serviceProviderId.username,
                    },
                })),
                totalPages,
                currentPage: page,
                totalCount
            }
        } else if (online && role === Role.PROVIDER) {
            return {
                items: (bookings as OnlineBookingsViewForProvider).map(booking => ({
                    ...booking,
                    _id: booking._id.toString(),
                    userId: {
                        username: booking.userId.username,
                    },
                })),
                totalPages,
                currentPage: page,
                totalCount
            }
        } else {
            return {
                items: (bookings as BookingsBaseView).map(booking => ({
                    ...booking,
                    _id: booking._id.toString(),
                    serviceProviderId: booking.serviceProviderId?.toString(),
                })),
                totalPages,
                currentPage: page,
                totalCount
            }
        }
    }

    async findDetails(query: BookingDetailsQuery): Promise<BookingDetailsView | null> {
        const { bookingId } = query;
        const booking = await BookingModel.findById(new Types.ObjectId(bookingId), {
            _id: 0,
            appointmentDate: 1,
            appointmentMode: 1,
            appointmentStatus: 1,
            appointmentTime: 1,
            createdAt: 1,
            onlineTrack: 1,
            statusTrack: 1,
            videoCallRoomId: 1,
        })
            .populate({
                path: "userId",
                select: "username email",
            })
            .populate({
                path: "serviceProviderId",
                select: "username email",
            })
            .lean<BookingDetailsView>();

        if (!booking) return null;

        return {
            appointmentDate: booking.appointmentDate,
            appointmentMode: booking.appointmentMode,
            appointmentStatus: booking.appointmentStatus,
            appointmentTime: booking.appointmentTime,
            createdAt: booking.createdAt,
            onlineTrack: booking.onlineTrack,
            statusTrack: booking.statusTrack,
            videoCallRoomId: booking.videoCallRoomId,
            userId: {
                username: booking.userId.username,
                email: booking.userId.email,
            },
            serviceProviderId: {
                username: booking.serviceProviderId.username,
                email: booking.serviceProviderId.email,
            },
        };
    }

    async findGraphDataForDashboard(query: BookingGraphStatsForProviderQuery): Promise<BookingGraphStatsForProviderView | null> {
        const { providerId, subscriptionGuard, endDate, startDate, isAdmin, timeZone } = query;
        const effectiveTimeZone = timeZone || defaultTimezone;

        const matchFilter: FilterQuery<BookingProps> = {};
        const facet: Record<string, any> = {};
        const isProvider = !!providerId && !isAdmin;
        const guardLevel = isAdmin ? 3 : (subscriptionGuard ?? 0);

        const { start, end } = getDateRangeMetrics({
            startDate,
            endDate,
            timeZone: effectiveTimeZone
        })

        if (isProvider) {
            matchFilter.serviceProviderId = new Types.ObjectId(providerId);
        }

        matchFilter.createdAt = { $gte: start, $lte: end };


        if (isProvider && (subscriptionGuard ?? 0) === 0) {
            return null;
        }

        if (guardLevel >= 1) {
            facet.appointmentsOvertimeChartData = [
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate", timezone: effectiveTimeZone },
                        },
                        completed: {
                            $sum: {
                                $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.COMPLETED] }, 1, 0],
                            },
                        },
                        missed: {
                            $sum: {
                                $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.NOT_ATTENDED] }, 1, 0],
                            },
                        },
                        cancelled: {
                            $sum: {
                                $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.CANCELLED] }, 1, 0],
                            },
                        },
                    },
                },
                {
                    $project: {
                        date: "$_id",
                        completed: 1,
                        missed: 1,
                        cancelled: 1,
                        _id: 0,
                    },
                },
                { $sort: { date: 1 } },
            ];

            facet.topBookingDaysChartData = [
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate", timezone: effectiveTimeZone } },
                        count: { $sum: 1 },
                    },
                },
                { $project: { day: "$_id", count: 1, _id: 0 } },
                { $sort: { count: -1 } },
                { $limit: 5 },
            ];
        }

        if (guardLevel >= 2) {
            facet.appointmentModeChartData = [
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate", timezone: effectiveTimeZone } },
                        },
                        online: {
                            $sum: { $cond: [{ $eq: ["$appointmentMode", "online"] }, 1, 0] },
                        },
                        offline: {
                            $sum: { $cond: [{ $eq: ["$appointmentMode", "offline"] }, 1, 0] },
                        },
                    },
                },
                {
                    $project: { date: "$_id.date", online: 1, offline: 1, _id: 0 },
                },
                { $sort: { date: 1 } },
            ];

            facet.newVsReturningUsersChartData = [
                { $sort: { createdAt: 1 } },
                {
                    $group: {
                        _id: "$userId",
                        firstAppointmentDate: { $first: "$appointmentDate" },
                    },
                },
                {
                    $project: {
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$firstAppointmentDate", timezone: effectiveTimeZone } },
                    },
                },
                {
                    $group: {
                        _id: "$date",
                        newUsers: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        date: "$_id",
                        newUsers: 1,
                        returningUsers: { $literal: 0 },
                        _id: 0,
                    },
                },
                { $sort: { date: 1 } },
            ];
        }

        if (guardLevel >= 3) {
            facet.peakBookingHoursChartData = [
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate", timezone: effectiveTimeZone } },
                            hour: "$appointmentTime",
                        },
                        bookings: { $sum: 1 },
                    },
                },
                {
                    $project: { date: "$_id.date", hour: "$_id.hour", bookings: 1, _id: 0 },
                },
                { $sort: { bookings: -1 } },
            ];

            facet.completionBreakdownChartData = [
                {
                    $group: {
                        _id: "$appointmentStatus",
                        value: { $sum: 1 },
                    },
                },
                {
                    $project: {
                        status: {
                            $switch: {
                                branches: [
                                    { case: { $eq: ["$_id", AppointmentStatus.COMPLETED] }, then: "completed" },
                                    { case: { $eq: ["$_id", AppointmentStatus.NOT_ATTENDED] }, then: "missed" },
                                    { case: { $eq: ["$_id", AppointmentStatus.CANCELLED] }, then: "cancelled" },
                                    { case: { $eq: ["$_id", AppointmentStatus.REJECTED_BY_PROVIDER] }, then: "rejected" },
                                    { case: { $eq: ["$_id", AppointmentStatus.CONFIRMED] }, then: "confirmed" },
                                    { case: { $eq: ["$_id", AppointmentStatus.BOOKED] }, then: "booked" },
                                    { case: { $eq: ["$_id", AppointmentStatus.PENDING] }, then: "pending" },
                                ],
                            },
                        },
                        value: 1,
                        _id: 0,
                    },
                },
            ];
        }

        const result = await BookingModel.aggregate([
            {
                $match: matchFilter,
            },
            {
                $facet: facet,
            },
        ]);

        const data = result[0];

        return {
            appointmentsOvertimeChartData: data.appointmentsOvertimeChartData ?? [],
            appointmentModeChartData: data.appointmentModeChartData ?? [],
            completionBreakdownChartData: data.completionBreakdownChartData ?? [],
            newVsReturningUsersChartData: data.newVsReturningUsersChartData ?? [],
            peakBookingHoursChartData: data.peakBookingHoursChartData ?? [],
            topBookingDaysChartData: data.topBookingDaysChartData ?? [],
        }
    }

    async findStatsDataForProviderDashboard(query: BookingStatsForProviderQuery): Promise<BookingStatsForProviderView> {
        const { providerId, timeZone, startDate, endDate } = query;

        const { start, end, prevStart, prevEnd } = getDateRangeMetrics({
            startDate,
            endDate,
            timeZone,
        });

        interface AggregationFacetResult {
            totalAppointments: number;
            completedAppointments: number;
            missedAppointments: number;
            cancelledAppointmentsByUser: number;
            rejectedAppointmentsByProvider: number;
        }

        interface AggregationResult {
            current: AggregationFacetResult[];
            previous: AggregationFacetResult[];
            today: { count: number }[];
            yesterday: { count: number }[];
        }

        const matchFilter: FilterQuery<BookingProps> = {
            serviceProviderId: new Types.ObjectId(providerId),
        };

        const effectiveTimeZone = timeZone || defaultTimezone;
        const todayDate = formatInTimeZone(new Date(), effectiveTimeZone, "yyyy-MM-dd");
        const { start: todayStart, end: todayEnd } = getDayBoundaryMetrics(
            todayDate,
            effectiveTimeZone
        );
        const { start: yesterdayStart, end: yesterdayEnd } = getDayBoundaryMetrics(
            shiftDateOnly(todayDate, -1),
            effectiveTimeZone
        );

        const [result] = await BookingModel.aggregate<AggregationResult>([
            {
                $match: matchFilter,
            },
            {
                $facet: {
                    // Current selected period
                    current: [
                        {
                            $match: {
                                appointmentDate: {
                                    $gte: start,
                                    $lte: end,
                                },
                            },
                        },
                        {
                            $group: {
                                _id: null,

                                totalAppointments: {
                                    $sum: 1,
                                },

                                completedAppointments: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $eq: [
                                                    '$appointmentStatus',
                                                    AppointmentStatus.COMPLETED,
                                                ],
                                            },
                                            1,
                                            0,
                                        ],
                                    },
                                },

                                missedAppointments: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $eq: [
                                                    '$appointmentStatus',
                                                    AppointmentStatus.NOT_ATTENDED,
                                                ],
                                            },
                                            1,
                                            0,
                                        ],
                                    },
                                },

                                cancelledAppointmentsByUser: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $eq: [
                                                    '$appointmentStatus',
                                                    AppointmentStatus.CANCELLED,
                                                ],
                                            },
                                            1,
                                            0,
                                        ],
                                    },
                                },

                                rejectedAppointmentsByProvider: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $eq: [
                                                    '$appointmentStatus',
                                                    AppointmentStatus.REJECTED_BY_PROVIDER,
                                                ],
                                            },
                                            1,
                                            0,
                                        ],
                                    },
                                },
                            },
                        },
                    ],

                    // Previous selected period
                    previous: [
                        {
                            $match: {
                                appointmentDate: {
                                    $gte: prevStart,
                                    $lte: prevEnd,
                                },
                            },
                        },
                        {
                            $group: {
                                _id: null,

                                totalAppointments: {
                                    $sum: 1,
                                },

                                completedAppointments: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $eq: [
                                                    '$appointmentStatus',
                                                    AppointmentStatus.COMPLETED,
                                                ],
                                            },
                                            1,
                                            0,
                                        ],
                                    },
                                },

                                missedAppointments: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $eq: [
                                                    '$appointmentStatus',
                                                    AppointmentStatus.NOT_ATTENDED,
                                                ],
                                            },
                                            1,
                                            0,
                                        ],
                                    },
                                },

                                cancelledAppointmentsByUser: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $eq: [
                                                    '$appointmentStatus',
                                                    AppointmentStatus.CANCELLED,
                                                ],
                                            },
                                            1,
                                            0,
                                        ],
                                    },
                                },

                                rejectedAppointmentsByProvider: {
                                    $sum: {
                                        $cond: [
                                            {
                                                $eq: [
                                                    '$appointmentStatus',
                                                    AppointmentStatus.REJECTED_BY_PROVIDER,
                                                ],
                                            },
                                            1,
                                            0,
                                        ],
                                    },
                                },
                            },
                        },
                    ],

                    // Today's appointments
                    today: [
                        {
                            $match: {
                                appointmentDate: {
                                    $gte: todayStart,
                                    $lte: todayEnd,
                                },
                            },
                        },
                        {
                            $count: 'count',
                        },
                    ],

                    // Yesterday's appointments
                    yesterday: [
                        {
                            $match: {
                                appointmentDate: {
                                    $gte: yesterdayStart,
                                    $lte: yesterdayEnd,
                                },
                            },
                        },
                        {
                            $count: 'count',
                        },
                    ],
                },
            },
        ]);

        const defaultStats: AggregationFacetResult = {
            totalAppointments: 0,
            completedAppointments: 0,
            missedAppointments: 0,
            cancelledAppointmentsByUser: 0,
            rejectedAppointmentsByProvider: 0,
        };

        const current = result?.current[0] || defaultStats;
        const previous = result?.previous[0] || defaultStats;

        const todayCount = result?.today[0]?.count ?? 0;
        const yesterdayCount = result?.yesterday[0]?.count ?? 0;

        return {
            totalAppointments: formatStatMetric(current.totalAppointments, previous.totalAppointments),
            completedAppointments: formatStatMetric(current.completedAppointments, previous.completedAppointments),
            missedAppointments: formatStatMetric(current.missedAppointments, previous.missedAppointments),
            cancelledAppointmentsByUser: formatStatMetric(current.cancelledAppointmentsByUser, previous.cancelledAppointmentsByUser),
            rejectedAppointmentsByProvider: formatStatMetric(current.rejectedAppointmentsByProvider, previous.rejectedAppointmentsByProvider),
            todaysAppointments: formatStatMetric(todayCount, yesterdayCount),
        };
    }

    async findStatsDataForAdminDashboard(query: BookingsStatsDataAdminQuery): Promise<BookingsStatsDataAdminView> {
        const { startDate, endDate, timeZone } = query;

        const { start, end, prevStart, prevEnd } = getDateRangeMetrics({
            startDate,
            endDate,
            timeZone,
        });

        const [result] = await BookingModel.aggregate([
            {
                $match: {
                    appointmentDate: {
                        $gte: prevStart,
                        $lte: end,
                    },
                },
            },
            {
                $facet: {
                    current: [
                        { $match: { appointmentDate: { $gte: start, $lte: end } } },
                        {
                            $group: {
                                _id: null,
                                totalAppointments: { $sum: 1 },
                                completedAppointments: {
                                    $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.COMPLETED] }, 1, 0] }
                                },
                                cancelledAppointments: {
                                    $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.CANCELLED] }, 1, 0] }
                                },
                                missedAppointments: {
                                    $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.NOT_ATTENDED] }, 1, 0] }
                                },
                                rejectedAppointments: {
                                    $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.REJECTED_BY_PROVIDER] }, 1, 0] }
                                }
                            }
                        }
                    ],
                    previous: [
                        { $match: { appointmentDate: { $gte: prevStart, $lte: prevEnd } } },
                        {
                            $group: {
                                _id: null,
                                totalAppointments: { $sum: 1 },
                                completedAppointments: {
                                    $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.COMPLETED] }, 1, 0] }
                                },
                                cancelledAppointments: {
                                    $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.CANCELLED] }, 1, 0] }
                                },
                                missedAppointments: {
                                    $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.NOT_ATTENDED] }, 1, 0] }
                                },
                                rejectedAppointments: {
                                    $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.REJECTED_BY_PROVIDER] }, 1, 0] }
                                }
                            }
                        }
                    ]
                }
            }
        ]);

        const defaultStats = {
            totalAppointments: 0,
            completedAppointments: 0,
            cancelledAppointments: 0,
            missedAppointments: 0,
            rejectedAppointments: 0
        };

        const current = result?.current[0] || defaultStats;
        const previous = result?.previous[0] || defaultStats;

        return {
            totalAppointments: formatStatMetric(current.totalAppointments, previous.totalAppointments),
            completedAppointments: formatStatMetric(current.completedAppointments, previous.completedAppointments),
            cancelledAppointments: formatStatMetric(current.cancelledAppointments, previous.cancelledAppointments),
            missedAppointments: formatStatMetric(current.missedAppointments, previous.missedAppointments),
            rejectedAppointments: formatStatMetric(current.rejectedAppointments, previous.rejectedAppointments)
        };
    }

    async findTodaysBookingsForCronjob(): Promise<boolean> {
        const now = new Date();
        const bookings = await BookingModel.updateMany(
            {
                appointmentStatus: AppointmentStatus.CONFIRMED,
                sessionEndTime: { $lt: now }
            },
            {
                $set: { appointmentStatus: AppointmentStatus.NOT_ATTENDED },
                $push: {
                    statusTrack: {
                        appointmentStatus: AppointmentStatus.NOT_ATTENDED,
                        time: now
                    }
                }
            }
        );
        return bookings.modifiedCount > 0;
    }

    async findUsersforChatSideBar(query: BookingUsersForChatQuery): Promise<BookingUsersForChatView> {
        const { userId, role, timeZone } = query;

        const matchFilter: FilterQuery<BookingProps> = {};
        let targetLookupField: string;

        if (role === Role.USER) {
            matchFilter.userId = new Types.ObjectId(userId);
            targetLookupField = "$serviceProviderId";
        } else {
            matchFilter.serviceProviderId = new Types.ObjectId(userId);
            targetLookupField = "$userId";
        }

        const effectiveTimeZone = timeZone || defaultTimezone;
        const todayStr = formatInTimeZone(new Date(), effectiveTimeZone, 'yyyy-MM-dd');
        const yesterdayStr = shiftDateOnly(todayStr, -1);
        const tomorrowStr = shiftDateOnly(todayStr, 1);

        const { start, end } = getDateRangeMetrics({
            startDate: yesterdayStr,
            endDate: tomorrowStr,
            timeZone: effectiveTimeZone,
        });

        const users = await BookingModel.aggregate([
            {
                $match: {
                    ...matchFilter,
                    appointmentDate: {
                        $gte: start,
                        $lte: end,
                    },
                    appointmentStatus: AppointmentStatus.CONFIRMED
                }
            },
            {
                $lookup: {
                    from: "users",
                    let: { targetUserId: targetLookupField },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$targetUserId"] }
                            }
                        },
                        {
                            $project: {
                                username: 1,
                                profileImage: 1
                            }
                        }
                    ],
                    as: "chatPartner"
                }
            },
            { $unwind: "$chatPartner" },
            {
                $group: {
                    _id: "$chatPartner._id",
                    username: { $first: "$chatPartner.username" },
                    profileImage: { $first: "$chatPartner.profileImage" }
                }
            },
        ]);
        return users.map(user => ({
            ...user,
            _id: user._id.toString(),
        }));
    }
}

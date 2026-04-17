import dayjs from "dayjs";
import { FilterQuery, Types } from "mongoose";
import { Role } from "../../domain/enums/common.enum";
import { BookingModel } from "../models/booking.model";
import { getStartAndEndDate } from "../../shared/utils/dateTime";
import { IBookingQueries } from "../../application/queries/IBooking.queries";
import { AppointmentStatus } from "../../domain/enums/appointmentStatus.enum";
import { TableData, BookingDTO } from "../../application/dtos/common.dto";
import { BookingDetailsQuery, BookingDetailsView, BookingGraphStatsForProviderQuery, BookingGraphStatsForProviderView, BookingsBaseView, BookingsQuery, BookingsStatsForAdminQuery, BookingsStatsForAdminView, BookingStatsForProviderQuery, BookingStatsForProviderView, BookingsView, BookingUsersForChatQuery, BookingUsersForChatView, OnlineBookingsViewForProvider, OnlineBookingsViewForUser } from "../../application/dtos/booking.dto";

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
                data: (bookings as OnlineBookingsViewForUser).map(booking => ({
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
                data: (bookings as OnlineBookingsViewForProvider).map(booking => ({
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
                data: (bookings as BookingsBaseView).map(booking => ({
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

    async findGraphDataForProviderDashboard(query: BookingGraphStatsForProviderQuery): Promise<BookingGraphStatsForProviderView | null> {
        const { providerId, subscriptionGuard, endDate, startDate } = query;

        const matchFilter: FilterQuery<BookingDTO> = {
            serviceProviderId: new Types.ObjectId(providerId),
        };

        if (startDate && endDate) {
            matchFilter.createdAt = { $gte: startDate, $lte: endDate };
        }

        const facet: Record<string, any> = {};

        if (subscriptionGuard >= 1) {
            facet.appointmentsOvertimeChartData = [
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" },
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
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } },
                        count: { $sum: 1 },
                    },
                },
                { $project: { day: "$_id", count: 1, _id: 0 } },
                { $sort: { count: -1 } },
                { $limit: 5 },
            ];
        }

        if (subscriptionGuard >= 2) {
            facet.appointmentModeChartData = [
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } },
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
                        date: { $dateToString: { format: "%Y-%m-%d", date: "$firstAppointmentDate" } },
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

        if (subscriptionGuard >= 3) {
            facet.peakBookingHoursChartData = [
                {
                    $group: {
                        _id: {
                            date: { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } },
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
                                ],
                            },
                        },
                        value: 1,
                        _id: 0,
                    },
                },
            ];
        }

        if (subscriptionGuard === 0) {
            return null;
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
        const { providerId } = query;

        const matchFilter: FilterQuery<BookingDTO> = {
            serviceProviderId: new Types.ObjectId(providerId),
        };

        const { startDate, endDate } = getStartAndEndDate(
            query.startDate,
            query.endDate
        );

        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setUTCDate(today.getUTCDate() + 1);

        const result = await BookingModel.aggregate([
            {
                $match: matchFilter,
            },

            {
                $facet: {

                    rangeStats: [
                        {
                            $match: {
                                ...(startDate && endDate && {
                                    appointmentDate: { $gte: startDate, $lte: endDate },
                                }),
                            },
                        },
                        {
                            $group: {
                                _id: null,
                                totalAppointments: { $sum: 1 },

                                completedAppointments: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$appointmentStatus", AppointmentStatus.COMPLETED] },
                                            1,
                                            0,
                                        ],
                                    },
                                },

                                missedAppointments: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$appointmentStatus", AppointmentStatus.NOT_ATTENDED] },
                                            1,
                                            0,
                                        ],
                                    },
                                },

                                cancelledAppointmentsByUser: {
                                    $sum: {
                                        $cond: [
                                            { $eq: ["$appointmentStatus", AppointmentStatus.CANCELLED] },
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
                                                    "$appointmentStatus",
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

                    todayStats: [
                        {
                            $match: {
                                appointmentDate: {
                                    $gte: today,
                                    $lt: tomorrow,
                                },
                                appointmentStatus: AppointmentStatus.BOOKED,
                            },
                        },
                        {
                            $count: "todaysAppointments",
                        },
                    ],
                },
            },

            {
                $project: {
                    range: { $arrayElemAt: ["$rangeStats", 0] },
                    today: { $arrayElemAt: ["$todayStats", 0] },
                },
            },

            {
                $project: {
                    totalAppointments: { $ifNull: ["$range.totalAppointments", 0] },
                    completedAppointments: { $ifNull: ["$range.completedAppointments", 0] },
                    missedAppointments: { $ifNull: ["$range.missedAppointments", 0] },
                    cancelledAppointmentsByUser: {
                        $ifNull: ["$range.cancelledAppointmentsByUser", 0],
                    },
                    rejectedAppointmentsByProvider: {
                        $ifNull: ["$range.rejectedAppointmentsByProvider", 0],
                    },
                    todaysAppointments: {
                        $ifNull: ["$today.todaysAppointments", 0],
                    },
                },
            },
        ]);

        return result[0] || {
            totalAppointments: 0,
            completedAppointments: 0,
            missedAppointments: 0,
            cancelledAppointmentsByUser: 0,
            rejectedAppointmentsByProvider: 0,
            todaysAppointments: 0,
        };
    }

    async findStatsDataForAdminDashboard(query: BookingsStatsForAdminQuery): Promise<BookingsStatsForAdminView> {
        const { startDate, endDate } = getStartAndEndDate(query.startDate, query.endDate);
        const result = await BookingModel.aggregate([
            {
                $match: {
                    appointmentDate: {
                        $gte: startDate,
                        $lte: endDate,
                    },
                },
            },
            {
                $group: {
                    _id: null,
                    totalAppointments: { $sum: 1 },
                    completedAppointments: { $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.COMPLETED] }, 1, 0] } },
                    cancelledAppointments: { $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.CANCELLED] }, 1, 0] } },
                    missedAppointments: { $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.NOT_ATTENDED] }, 1, 0] } },
                    rejectedAppointments: { $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.REJECTED_BY_PROVIDER] }, 1, 0] } }
                }
            },
        ])
        return result[0] || {
            totalAppointments: 0,
            completedAppointments: 0,
            cancelledAppointments: 0,
            missedAppointments: 0,
            rejectedAppointments: 0
        };
    }

    async findTodaysBookingsForCronjob(): Promise<boolean> {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        const bookings = await BookingModel.updateMany(
            {
                appointmentStatus: AppointmentStatus.CONFIRMED,
                appointmentDate: {
                    $gte: todayStart,
                    $lt: todayEnd
                }
            },
            {
                $set: { appointmentStatus: AppointmentStatus.NOT_ATTENDED },
                $push: {
                    statusTrack: {
                        appointmentStatus: AppointmentStatus.NOT_ATTENDED,
                        time: new Date()
                    }
                }
            }
        );
        return bookings.modifiedCount > 0;
    }

    async findUsersforChatSideBar(query: BookingUsersForChatQuery): Promise<BookingUsersForChatView> {
        const { userId, role } = query;

        const matchFilter: FilterQuery<BookingDTO> = {};

        if (role === Role.USER) {
            matchFilter.userId = new Types.ObjectId(userId);
        } else {
            matchFilter.serviceProviderId = new Types.ObjectId(userId);
        }

        const users = await BookingModel.aggregate([
            {
                $match: {
                    ...matchFilter,
                    appointmentDate: {
                        $gte: dayjs().subtract(1, 'day').startOf('day').toDate(),
                        $lte: dayjs().add(1, 'day').startOf('day').toDate(),
                    },
                }
            },
            {
                $lookup: {
                    from: "users",
                    let: { userId: "$userId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$_id", "$$userId"] },
                                        { $eq: ["$role", role] }
                                    ]
                                }
                            }
                        },
                        {
                            $project: {
                                username: 1,
                                profileImage: 1
                            }
                        }
                    ],
                    as: "user"
                }
            },
            { $unwind: "$user" },
            {
                $group: {
                    _id: "$user._id",
                    username: { $first: "$user.username" },
                    profileImage: { $first: "$user.profileImage" }
                }
            },
            {
                $project: {
                    _id: 1,
                    username: 1,
                    profileImage: 1
                }
            }
        ]);
        return users.map(user => ({
            ...user,
            _id: user._id.toString(),
        }));
    }
}

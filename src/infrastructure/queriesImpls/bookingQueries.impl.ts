import dayjs from "dayjs";
import { Types } from "mongoose";
import { Role } from "../../domain/enums/role.enum";
import { BookingModel } from "../models/booking.model";
import { IBookingQueries } from "../../application/queries/IBooking.queries";
import { AppointmentStatus } from "../../domain/enums/appointmentStatus.enum";
import { endOfDay, startOfDay, startOfToday, startOfTomorrow } from "date-fns";
import { UserFetchProvidersForChatSidebarResponse } from "../../application/dtos/user.dto";
import { AdminFetchDashboardAppointmentStatsDataResponse, AdminFetchTodaysBookingStatsForDashboardResponse } from "../../application/dtos/admin.dto";
import { FetchBookingsRequest, TableData, FetchBookingsResponse, FetchOnlineBookingsForProviderResponse, FetchOnlineBookingsForUserResponse, FetchBookingDetailsResponse } from "../../application/dtos/common.dto";
import { ProviderFetchDashboardGraphRepository, ProviderFetchDashboardGraphDataResponse, ProviderFetchDashboardBookingStatsDataResponse, ProviderFetchUsersForChatSideBarResponse } from "../../application/dtos/provider.dto";

export class BookingQueriesImpl implements IBookingQueries {

    async findAll({ page, limit, userId, serviceProviderId, online, raw, role }: FetchBookingsRequest): Promise<
        TableData<FetchBookingsResponse> |
        TableData<FetchOnlineBookingsForProviderResponse> |
        TableData<FetchOnlineBookingsForUserResponse>
    > {

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

        const project = raw ? rawProject : online ? onlineProject : rawProject;

        let query = BookingModel.find(filter, project)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean<FetchBookingsResponse | FetchOnlineBookingsForProviderResponse | FetchOnlineBookingsForUserResponse>();

        if (online && role === Role.User) {
            query = query.populate("serviceProviderId", "username -_id");
        } else if (online && role === Role.Provider) {
            query = query.populate("userId", "username -_id");
        }

        const [bookings, totalCount] = await Promise.all([
            query.exec(),
            BookingModel.countDocuments(filter)
        ]);

        const totalPages = Math.ceil(totalCount / limit);

        if (online && role === Role.User) {
            return {
                data: (bookings as FetchOnlineBookingsForUserResponse).map(booking => ({
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
        } else if (online && role === Role.Provider) {
            return {
                data: (bookings as FetchOnlineBookingsForProviderResponse).map(booking => ({
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
                data: (bookings as FetchBookingsResponse).map(booking => ({
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

    async findDetails(bookingId: string): Promise<FetchBookingDetailsResponse | null> {
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
            .lean<FetchBookingDetailsResponse>();

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

    async findGraphDataForProviderDashboard(payload: ProviderFetchDashboardGraphRepository): Promise<ProviderFetchDashboardGraphDataResponse | null> {
        const { providerId, subscriptionGuard, endDate, startDate } = payload

        console.log("providerId,  : ", providerId)
        console.log("subscriptionGuard,  : ", subscriptionGuard)
        console.log("endDate : ", endDate)
        console.log("startDate : ", startDate)

        const matchFilter: Record<string, any> = {
            serviceProviderId: new Types.ObjectId(providerId),
        };

        if (startDate && endDate) {
            matchFilter.createdAt = { $gte: startDate, $lte: endDate };
        }

        console.log("matchFilter : ", matchFilter);

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
                                $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.Completed] }, 1, 0],
                            },
                        },
                        missed: {
                            $sum: {
                                $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.NotAttended] }, 1, 0],
                            },
                        },
                        cancelled: {
                            $sum: {
                                $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.Cancelled] }, 1, 0],
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
                                    { case: { $eq: ["$_id", AppointmentStatus.Completed] }, then: "completed" },
                                    { case: { $eq: ["$_id", AppointmentStatus.NotAttended] }, then: "missed" },
                                    { case: { $eq: ["$_id", AppointmentStatus.Cancelled] }, then: "cancelled" },
                                    { case: { $eq: ["$_id", AppointmentStatus.RejectedByProvider] }, then: "rejected" },
                                    { case: { $eq: ["$_id", AppointmentStatus.Confirmed] }, then: "confirmed" },
                                    { case: { $eq: ["$_id", AppointmentStatus.Booked] }, then: "booked" },
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

    async findStatsDataForProviderDashboard(providerId: string): Promise<ProviderFetchDashboardBookingStatsDataResponse> {
        const today = startOfToday();
        const tomorrow = startOfTomorrow();

        const result = await BookingModel.aggregate([
            { $match: { serviceProviderId: new Types.ObjectId(providerId) } },
            {
                $group: {
                    _id: null,
                    totalAppointments: { $sum: 1 },
                    completedAppointments: {
                        $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.Completed] }, 1, 0] }
                    },
                    missedAppointments: {
                        $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.NotAttended] }, 1, 0] }
                    },
                    cancelledAppointmentsByUser: {
                        $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.Cancelled] }, 1, 0] }
                    },
                    rejectedAppointmentsByProvider: {
                        $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.RejectedByProvider] }, 1, 0] }
                    },
                    todaysAppointments: {
                        $sum: {
                            $cond: [
                                {
                                    $and: [
                                        { $gte: ["$appointmentDate", today] },
                                        { $lt: ["$appointmentDate", tomorrow] },
                                        { $eq: ["$appointmentStatus", AppointmentStatus.Booked] }
                                    ]
                                }, 1, 0
                            ]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalAppointments: 1,
                    completedAppointments: 1,
                    missedAppointments: 1,
                    cancelledAppointmentsByUser: 1,
                    rejectedAppointmentsByProvider: 1,
                    todaysAppointments: 1,
                },
            },
        ]);


        return result[0] || {
            totalAppointments: 0,
            completedAppointments: 0,
            missedAppointments: 0,
            cancelledAppointmentsByUser: 0,
            rejectedAppointmentsByProvider: 0,
            todaysAppointments: 0
        };
    }

    async findStatsDataForAdminDashboard(): Promise<AdminFetchDashboardAppointmentStatsDataResponse> {
        const result = await BookingModel.aggregate([
            {
                $group: {
                    _id: null,
                    totalAppointments: { $sum: 1 },
                    completedAppointments: { $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.Completed] }, 1, 0] } },
                    cancelledAppointments: { $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.Cancelled] }, 1, 0] } },
                    missedAppointments: { $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.NotAttended] }, 1, 0] } },
                    rejectedAppointments: { $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.RejectedByProvider] }, 1, 0] } }
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

    async findProvidersforChatSideBar(userId: string): Promise<UserFetchProvidersForChatSidebarResponse> {
        const providers = await BookingModel.aggregate([
            {
                $match: {
                    userId: new Types.ObjectId(userId),
                    appointmentDate: {
                        $gte: dayjs().subtract(1, 'day').startOf('day').toDate(),
                        $lte: dayjs().add(1, 'day').startOf('day').toDate(),
                    },
                }
            },
            {
                $lookup: {
                    from: "providers",
                    localField: "serviceProviderId",
                    foreignField: "_id",
                    as: "provider"
                }
            },
            { $unwind: "$provider" },
            {
                $group: {
                    _id: "$provider._id",
                    username: { $first: "$provider.username" },
                    profileImage: { $first: "$provider.profileImage" }
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
        return providers.map(provider => ({
            ...provider,
            _id: provider._id.toString(),
        }));
    }

    async findTodayStatsDataForAdminDashboard(): Promise<AdminFetchTodaysBookingStatsForDashboardResponse> {
        const startOfToday = startOfDay(new Date());
        const endOfToday = endOfDay(new Date());

        const result = await BookingModel.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfToday, $lte: endOfToday },
                },
            },
            {
                $group: {
                    _id: null,
                    todaysBookedAppointments: {
                        $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.Booked] }, 1, 0] }
                    },
                    todaysCancelledAppointments: {
                        $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.Cancelled] }, 1, 0] }
                    },
                    todaysCompletedAppointments: {
                        $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.Completed] }, 1, 0] }
                    }
                }
            },
        ])
        return result[0] || {
            todaysBookedAppointments: 0,
            todaysCancelledAppointments: 0,
            todaysCompletedAppointments: 0
        };
    }

    async findTodaysBookingsForCronjob(): Promise<boolean> {
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

        const bookings = await BookingModel.updateMany(
            {
                appointmentStatus: AppointmentStatus.Booked,
                appointmentDate: {
                    $gte: todayStart,
                    $lt: todayEnd
                }
            },
            {
                $set: { appointmentStatus: AppointmentStatus.NotAttended },
                $push: {
                    statusTrack: {
                        appointmentStatus: AppointmentStatus.NotAttended,
                        time: new Date()
                    }
                }
            }
        );
        return bookings.modifiedCount > 0;
    }

    async findUsersforChatSideBar(providerId: string): Promise<ProviderFetchUsersForChatSideBarResponse> {
        const users = await BookingModel.aggregate([
            {
                $match: {
                    serviceProviderId: new Types.ObjectId(providerId),
                    appointmentDate: {
                        $gte: dayjs().subtract(1, 'day').startOf('day').toDate(),
                        $lte: dayjs().add(1, 'day').startOf('day').toDate(),
                    },
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
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

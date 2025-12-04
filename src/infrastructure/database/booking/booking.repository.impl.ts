import dayjs from "dayjs";
import { Types } from "mongoose";
import { appointmentStatusArray, roleArray } from "../../../utils/constants";
import { BookingModel, IBooking } from "./booking.model";
import { User } from "../../../domain/entities/user.entity";
import { Booking } from "../../../domain/entities/booking.entity";
import { Provider } from "../../../domain/entities/provider.entity";
import { endOfDay, startOfDay, startOfToday, startOfTomorrow } from "date-fns";
import { UserFetchProvidersForChatSidebarResponse } from "../../dtos/user.dto";
import { AdminFetchDashboardAppointmentStatsDataResponse } from "../../dtos/admin.dto";
import { ProviderFetchDashboardBookingStatsDataResponse, ProviderFetchDashboardGraphDataResponse, ProviderFetchUsersForChatSideBarResponse } from "../../dtos/provider.dto";
import { AdminFetchTodaysBookingStatsForDashboardResponse, CreateBookingPayloadProps, IBookingRepository, ProviderFetchDashboardGraphRepository } from "../../../domain/repositories/IBooking.repository";
import { FetchBookingsRequest, ApiResponse, FetchBookingsResponse, userIdAndServiceProviderId, FetchOnlineBookingsForProviderResponse, FetchOnlineBookingsForUserResponse, FetchBookingDetailsResponse } from "../../dtos/common.dto";

export class BookingRepositoryImpl implements IBookingRepository {
    private mapToEntity(booking: IBooking): Booking {
        return new Booking(
            booking._id,
            booking.serviceProviderId,
            booking.userId,
            booking.appointmentDate,
            booking.appointmentTime,
            booking.appointmentMode,
            booking.appointmentStatus,
            booking.slotId,
            booking.paymentId,
            booking.videoCallRoomId,
            booking.googleEventId,
            booking.onlineTrack,
            booking.statusTrack,
            booking.createdAt,
            booking.updatedAt,
        )
    }

    async createBooking(booking: CreateBookingPayloadProps, options?: { session?: any }): Promise<Booking> {
        try {
            const newBooking = await BookingModel.create([booking], options);
            return this.mapToEntity(newBooking[0]);
        } catch (error) {
            console.log("createBooking : ", error);
            throw new Error("Failed to create appointment");
        }
    }

    async findBookingByUserId(userId: Types.ObjectId, day: string, date: Date, time: string): Promise<Array<Booking> | null> {
        try {
            const bookings = await BookingModel.find({
                userId: userId,
                appointmentDay: day,
                createdAt: date,
                appointmentTime: time,
                appointmentStatus: "Booked",
            });
            return bookings;
        } catch (error) {
            console.log("findBookingByUserId error : ", error);
            throw new Error("Failed to find booking by user id");
        }
    }

    async findBookingById(bookingId: Types.ObjectId): Promise<Booking | null> {
        try {
            const booking = await BookingModel.findById(bookingId);
            return booking ? this.mapToEntity(booking) : null;
        } catch (error) {
            console.log("findBookingById error : ", error);
            throw new Error("Failed to find booking by id");
        }
    }

    async findBookingByroomId(roomId: string): Promise<Booking | null> {
        try {
            const booking = await BookingModel.findOne({ videoCallRoomId: roomId });
            return booking ? this.mapToEntity(booking) : null;
        } catch (error) {
            console.log("findBookingByroomId error : ", error);
            throw new Error("Failed to find booking by room id");
        }
    }

    async updateBooking(booking: Booking, options: { session?: any } = {}): Promise<Booking | null> {
        try {
            const updatedBooking = await BookingModel.findByIdAndUpdate(
                booking._id,
                { ...booking },
                { new: true, ...options }
            );
            return updatedBooking ? this.mapToEntity(updatedBooking) : null;
        } catch (error) {
            console.log("updateBooking error : ", error);
            throw new Error("Failed to update booking");
        }
    }

    async findTodaysBookingForCronjob(): Promise<boolean> {
        try {
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

            const bookings = await BookingModel.updateMany(
                {
                    appointmentStatus: "Booked",
                    appointmentDate: {
                        $gte: todayStart,
                        $lt: todayEnd
                    }
                },
                {
                    $set: { appointmentStatus: "Not Attended" },
                    $push: {
                        statusTrack: {
                            appointmentStatus: "Not Attended",
                            time: new Date()
                        }
                    }
                }
            );
            return bookings.modifiedCount > 0;
        } catch (error) {
            console.log("findTodaysBookingForCronjob error : ", error);
            throw new Error("Failed to find bookings for today");
        }
    }

    async findAllBookings({ page, limit, userId, serviceProviderId, online, raw, role }: FetchBookingsRequest): Promise<ApiResponse<FetchBookingsResponse | FetchOnlineBookingsForProviderResponse | FetchOnlineBookingsForUserResponse>> {
        try {
            const skip = (page - 1) * limit;

            const filter: userIdAndServiceProviderId = {};
            if (userId) { filter.userId = userId; };
            if (serviceProviderId) { filter.serviceProviderId = serviceProviderId; };

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
                .lean();

            if (online && role === roleArray[1]) {
                query = query.populate("serviceProviderId", "username -_id");
            } else if (online && role === roleArray[2]) {
                query = query.populate("userId", "username -_id");
            }

            const [bookings, totalCount] = await Promise.all([
                query.exec(),
                BookingModel.countDocuments(filter)
            ]);
            const totalPages = Math.ceil(totalCount / limit);
            return {
                data: bookings.map(this.mapToEntity),
                totalPages,
                currentPage: page,
                totalCount
            }
        } catch (error) {
            console.log("findAllBookings error : ", error);
            throw new Error("Failed to find all bookings");
        }
    }

    async findUsersforChatSideBar(providerId: Provider["_id"]): Promise<ProviderFetchUsersForChatSideBarResponse> {
        try {
            const users = await BookingModel.aggregate([
                {
                    $match: {
                        serviceProviderId: providerId,
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
            return users;

        } catch (error) {
            console.log("findUsersforChatSideBar error : ", error);
            throw new Error("Failed to find all users for chat sidebar");
        }
    }

    async findProvidersforChatSideBar(userId: User["_id"]): Promise<UserFetchProvidersForChatSidebarResponse> {
        try {
            const providers = await BookingModel.aggregate([
                {
                    $match: {
                        userId: userId,
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
            return providers;

        } catch (error) {
            console.log("findProvidersforChatSideBar error : ", error);
            throw new Error("Failed to find providrs for chat sidebar");
        }
    }

    async findBookingStatsDataForProviderDashboard(providerId: Provider["_id"]): Promise<ProviderFetchDashboardBookingStatsDataResponse> {
        try {
            const today = startOfToday();
            const tomorrow = startOfTomorrow();

            const result = await BookingModel.aggregate([
                { $match: { serviceProviderId: providerId } },
                {
                    $group: {
                        _id: null,
                        totalAppointments: { $sum: 1 },
                        completedAppointments: {
                            $sum: { $cond: [{ $eq: ["$appointmentStatus", appointmentStatusArray[1]] }, 1, 0] }
                        },
                        missedAppointments: {
                            $sum: { $cond: [{ $eq: ["$appointmentStatus", appointmentStatusArray[4]] }, 1, 0] }
                        },
                        cancelledAppointmentsByUser: {
                            $sum: { $cond: [{ $eq: ["$appointmentStatus", appointmentStatusArray[2]] }, 1, 0] }
                        },
                        rejectedAppointmentsByProvider: {
                            $sum: { $cond: [{ $eq: ["$appointmentStatus", appointmentStatusArray[3]] }, 1, 0] }
                        },
                        todaysAppointments: {
                            $sum: {
                                $cond: [
                                    {
                                        $and: [
                                            { $gte: ["$appointmentDate", today] },
                                            { $lt: ["$appointmentDate", tomorrow] },
                                            { $eq: ["$appointmentStatus", appointmentStatusArray[0]] }
                                        ]
                                    }, 1, 0
                                ]
                            }
                        }
                    }
                }

            ])
            return result[0] || {
                totalAppointments: 0,
                completedAppointments: 0,
                missedAppointments: 0,
                cancelledAppointmentsByUser: 0,
                rejectedAppointmentsByProvider: 0,
                todaysAppointments: 0
            };
        } catch (error) {
            console.log("findBookingStatsDataForProviderDashboard error : ", error);
            throw new Error("Failed to find booking stats");
        }
    }

    async findBookingGraphDataForProviderDashboard(payload: ProviderFetchDashboardGraphRepository): Promise<ProviderFetchDashboardGraphDataResponse | null> {
        try {
            const { providerId, subscriptionGuard, endDate, startDate } = payload

            console.log("providerId,  : ", providerId)
            console.log("subscriptionGuard,  : ", subscriptionGuard)
            console.log("endDate : ", endDate)
            console.log("startDate : ", startDate)

            const matchFilter: Record<string, any> = {
                serviceProviderId: providerId,
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
                                    $cond: [{ $eq: ["$appointmentStatus", appointmentStatusArray[1]] }, 1, 0],
                                },
                            },
                            missed: {
                                $sum: {
                                    $cond: [{ $eq: ["$appointmentStatus", appointmentStatusArray[4]] }, 1, 0],
                                },
                            },
                            cancelled: {
                                $sum: {
                                    $cond: [{ $eq: ["$appointmentStatus", appointmentStatusArray[2]] }, 1, 0],
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
                                        { case: { $eq: ["$_id", appointmentStatusArray[1]] }, then: "completed" },
                                        { case: { $eq: ["$_id", appointmentStatusArray[4]] }, then: "missed" },
                                        { case: { $eq: ["$_id", appointmentStatusArray[2]] }, then: "cancelled" },
                                        { case: { $eq: ["$_id", appointmentStatusArray[3]] }, then: "rejected" },
                                        { case: { $eq: ["$_id", appointmentStatusArray[5]] }, then: "confirmed" },
                                        { case: { $eq: ["$_id", appointmentStatusArray[0]] }, then: "booked" },
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

            return result[0];
        } catch (error) {
            console.log("findBookingGraphDataForProviderDashboard error : ", error);
            throw new Error("Failed to find booking graph data");
        }
    }

    async findTodayBookingStatsForAdminDashboard(): Promise<AdminFetchTodaysBookingStatsForDashboardResponse> {
        try {
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
                            $sum: { $cond: [{ $eq: ["$appointmentStatus", appointmentStatusArray[0]] }, 1, 0] }
                        },
                        todaysCancelledAppointments: {
                            $sum: { $cond: [{ $eq: ["$appointmentStatus", appointmentStatusArray[2]] }, 1, 0] }
                        },
                        todaysCompletedAppointments: {
                            $sum: { $cond: [{ $eq: ["$appointmentStatus", appointmentStatusArray[1]] }, 1, 0] }
                        }
                    }
                },
            ])
            return result[0] || {
                todaysBookedAppointments: 0,
                todaysCancelledAppointments: 0,
                todaysCompletedAppointments: 0
            };
        } catch (error) {
            console.log("findTodayBookingStatsForAdminDashboard error : ", error);
            throw new Error("Failed to find booking stats for today");
        }
    }

    async findBookingStatsForAdminDashboard(): Promise<AdminFetchDashboardAppointmentStatsDataResponse> {
        try {
            const result = await BookingModel.aggregate([
                {
                    $group: {
                        _id: null,
                        totalAppointments: { $sum: 1 },
                        completedAppointments: { $sum: { $cond: [{ $eq: ["$appointmentStatus", appointmentStatusArray[1]] }, 1, 0] } },
                        cancelledAppointments: { $sum: { $cond: [{ $eq: ["$appointmentStatus", appointmentStatusArray[2]] }, 1, 0] } },
                        missedAppointments: { $sum: { $cond: [{ $eq: ["$appointmentStatus", appointmentStatusArray[4]] }, 1, 0] } },
                        rejectedAppointments: { $sum: { $cond: [{ $eq: ["$appointmentStatus", appointmentStatusArray[3]] }, 1, 0] } }
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
        } catch (error) {
            console.log("findBookingStatsForAdminDashboard error : ", error);
            throw new Error("Failed to find booking stats");
        }
    }

    async findBookingDetails(bookingId: Types.ObjectId): Promise<FetchBookingDetailsResponse | null> {
        try {
            const bookingDetails = await BookingModel.findById(bookingId, {
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

            return bookingDetails ?? null;
        } catch (error) {
            console.log("findBookingDetails error : ", error);
            throw new Error("Failed to find booking details");
        }
    }
}
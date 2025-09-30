import dayjs from "dayjs";
import { Types } from "mongoose";
import { BookingModel, IBooking } from "./booking.model";
import { User } from "../../../domain/entities/user.entity";
import { Provider } from "../../../domain/entities/provider.entity";
import { endOfDay, startOfDay, startOfToday, startOfTomorrow } from "date-fns";
import { UserFetchProvidersForChatSidebarResponse } from "../../dtos/user.dto";
import { AppointmentStatus, Booking } from "../../../domain/entities/booking.entity";
import { AdminFetchDashboardAppointmentStatsDataResponse } from "../../dtos/admin.dto";
import { FetchBookingsRequest, ApiResponse, FetchBookingsResponse, userIdAndServiceProviderId, FetchOnlineBookingsForProviderResponse, FetchOnlineBookingsForUserResponse, Role, FetchBookingDetailsResponse } from "../../dtos/common.dto";
import { AdminFetchTodaysBookingStatsForDashboardResponse, CreateBookingPayloadProps, IBookingRepository, ProviderFetchDashboardGraphRepository } from "../../../domain/repositories/IBooking.repository";
import { ProviderFetchDashboardBookingStatsDataResponse, ProviderFetchDashboardGraphDataResponse, ProviderFetchUsersForChatSideBar } from "../../dtos/provider.dto";

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

    async createBooking(booking: CreateBookingPayloadProps, options: { session?: any }): Promise<Booking> {
        try {
            const newBooking = await BookingModel.create([booking], options);
            return this.mapToEntity(newBooking[0]);
        } catch (error) {
            throw new Error("Appointment booking creating failed");
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
            throw new Error("Booking fetching failed");
        }
    }

    async findBookingById(bookingId: Types.ObjectId): Promise<Booking | null> {
        try {
            const booking = await BookingModel.findById(bookingId);
            return booking ? this.mapToEntity(booking) : null;
        } catch (error) {
            throw new Error("Finding booking failed");
        }
    }

    async findBookingByroomId(roomId: string): Promise<Booking | null> {
        try {
            const booking = await BookingModel.findOne({ videoCallRoomId: roomId });
            return booking ? this.mapToEntity(booking) : null;
        } catch (error) {
            throw new Error("Finding booking failed");
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
            throw new Error("Booking updating failed");
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
        } catch {
            return false;
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

            if (online && role === Role.user) {
                query = query.populate("serviceProviderId", "username -_id");
            } else if (online && role === Role.provider) {
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
        } catch {
            throw new Error("Bookings fetching failed")
        }
    }

    async findUsersforChatSideBar(providerId: Provider["_id"]): Promise<ProviderFetchUsersForChatSideBar> {
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

        } catch {
            throw new Error("Users fetching failed");
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

        } catch {
            throw new Error("providers fetching failed");
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
                            $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.Completed] }, 1, 0] }
                        },
                        missedAppointments: {
                            $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.NotAttended] }, 1, 0] }
                        },
                        cancelledAppointmentsByUser: {
                            $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.Cancelled] }, 1, 0] }
                        },
                        rejectedAppointmentsByProvider: {
                            $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.Rejected] }, 1, 0] }
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
        } catch {
            throw new Error("Dashboard stats fetching failed");
        }
    }

    async findBookingGraphDataForProviderDashboard(payload: ProviderFetchDashboardGraphRepository): Promise<ProviderFetchDashboardGraphDataResponse | null> {
        try {

            const { providerId, subscriptionGuard, endDate, startDate } = payload

            console.log("providerId,  : ",providerId)
            console.log("subscriptionGuard,  : ",subscriptionGuard)
            console.log("endDate : ",endDate)
            console.log("startDate : ",startDate)

            const matchFilter: Record<string, any> = {
                serviceProviderId: providerId,
            };

            if (startDate && endDate) {
                matchFilter.createdAt = { $gte: startDate, $lte: endDate };
            }

            console.log("matchFilter : ",matchFilter);

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
                                        { case: { $eq: ["$_id", AppointmentStatus.Rejected] }, then: "rejected" },
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

            return result[0];
        } catch {
            throw new Error("Dashboard graph data fetching error");
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
        } catch {
            throw new Error("Admin dashboard today booking stats fetching failed")
        }
    }

    async findBookingStatsForAdminDashboard(): Promise<AdminFetchDashboardAppointmentStatsDataResponse> {
        try {
            const result = await BookingModel.aggregate([
                {
                    $group: {
                        _id: null,
                        totalAppointments: { $sum: 1 },
                        completedAppointments: { $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.Completed] }, 1, 0] } },
                        cancelledAppointments: { $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.Cancelled] }, 1, 0] } },
                        missedAppointments: { $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.NotAttended] }, 1, 0] } },
                        rejectedAppointments: { $sum: { $cond: [{ $eq: ["$appointmentStatus", AppointmentStatus.Rejected] }, 1, 0] } }
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
            throw new Error("Admin dashboard booking stats fetching failed")
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
            throw new Error("Booking details fetching failed");
        }
    }
}
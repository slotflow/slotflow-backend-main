import dayjs from "dayjs";
import { Types } from "mongoose";
import { endOfDay, startOfDay, startOfToday, startOfTomorrow } from "date-fns";
import { BookingModel, IBooking } from "./booking.model";
import { User } from "../../../domain/entities/user.entity";
import { AppointmentStatus, Booking } from "../../../domain/entities/booking.entity";
import { Provider } from "../../../domain/entities/provider.entity";
import { UserFetchProvidersForChatSidebarResponse } from "../../dtos/user.dto";
import { AdminFetchTodaysBookingStatsForDashboardResponse, CreateBookingPayloadProps, IBookingRepository } from "../../../domain/repositories/IBooking.repository";
import { FetchBookingsRequest, ApiResponse, FetchBookingsResponse, userIdAndServiceProviderId } from "../../dtos/common.dto";
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

    async updateBooking(booking: Booking): Promise<Booking | null> {
        try {
            const updatedBooking = await BookingModel.findByIdAndUpdate(
                booking._id,
                { ...booking },
                { new: true }
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
                    $set: { appointmentStatus: "Not Attended" }
                }
            );
            return bookings.modifiedCount > 0 ? true : false;
        } catch {
            return false;
        }
    }

    async findAllBookings({ page, limit, userId, serviceProviderId }: FetchBookingsRequest): Promise<ApiResponse<FetchBookingsResponse>> {
        try {
            const skip = (page - 1) * limit;
            const filter: userIdAndServiceProviderId = {};
            if (userId) { filter.userId = userId; }
            if (serviceProviderId) { filter.serviceProviderId = serviceProviderId; }
            const [payments, totalCount] = await Promise.all([
                BookingModel.find(filter, {
                    _id: 1,
                    appointmentDate: 1,
                    appointmentMode: 1,
                    appointmentStatus: 1,
                    appointmentTime: 1,
                    createdAt: 1,
                }).skip(skip).limit(limit).sort({ createdAt: 1 }).lean(),
                BookingModel.countDocuments(),
            ]);
            const totalPages = Math.ceil(totalCount / limit);
            return {
                data: payments.map(this.mapToEntity),
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
                { $match: { providerId: providerId } },
                {
                    $facet: {
                        totalAppointments: [
                            { $count: "count" }
                        ],
                        completedAppointments: [
                            { $match: { status: "Completed" } },
                            { $count: "count" }
                        ],
                        missedAppointments: [
                            { $match: { status: "Not Attended" } },
                            { $count: "count" }
                        ],
                        cancelledAppointmentsByUser: [
                            { $match: { status: "Cancelled" } },
                            { $count: "count" }
                        ],
                        rejectedAppointmentsByProvider: [
                            { $match: { status: "Rejected By Provider" } },
                            { $count: "count" }
                        ],
                        todaysAppointments: [
                            {
                                $match: {
                                    appointmentDate: { $gte: today, $lt: tomorrow },
                                    status: "Booked"
                                }
                            },
                            { $count: "count" }
                        ]
                    }
                },
                {
                    $project: {
                        totalAppointments: { $ifNull: [{ $arrayElemAt: ["$totalAppointments.count", 0] }, 0] },
                        completedAppointments: { $ifNull: [{ $arrayElemAt: ["$completedAppointments.count", 0] }, 0] },
                        missedAppointments: { $ifNull: [{ $arrayElemAt: ["$missedAppointments.count", 0] }, 0] },
                        cancelledAppointmentsByUser: { $ifNull: [{ $arrayElemAt: ["$cancelledAppointmentsByUser.count", 0] }, 0] },
                        rejectedAppointmentsByProvider: { $ifNull: [{ $arrayElemAt: ["$rejectedAppointmentsByProvider.count", 0] }, 0] },
                        todaysAppointments: { $ifNull: [{ $arrayElemAt: ["$todaysAppointments.count", 0] }, 0] },
                    }
                }
            ]);
            return result[0];
        } catch {
            throw new Error("Dashboard stats fetching failed");
        }
    }

    async findBookingGraphDataForProviderDashboard(providerId: Provider["_id"]): Promise<ProviderFetchDashboardGraphDataResponse> {
        try {

            const startDate = new Date();
            startDate.setHours(0, 0, 0, 0);
            startDate.setDate(startDate.getDate() - 6);

            const result = await BookingModel.aggregate([
                {
                    $match: {
                        serviceProviderId: providerId,
                        appointmentDate: { $gte: startDate },
                    },
                },
                {
                    $facet: {
                        appointmentsOvertimeChartData: [
                            {
                                $group: {
                                    _id: {
                                        $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" },
                                    },
                                    completed: {
                                        $sum: {
                                            $cond: [{ $eq: ["$appointmentStatus", "Completed"] }, 1, 0],
                                        },
                                    },
                                    missed: {
                                        $sum: {
                                            $cond: [{ $eq: ["$appointmentStatus", "Not Attended"] }, 1, 0],
                                        },
                                    },
                                    cancelled: {
                                        $sum: {
                                            $cond: [{ $eq: ["$appointmentStatus", "Cancelled"] }, 1, 0],
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
                        ],

                        peakBookingHoursChartData: [
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
                                $project: {
                                    date: "$_id.date",
                                    hour: "$_id.hour",
                                    bookings: 1,
                                    _id: 0,
                                },
                            },
                            { $sort: { bookings: -1 } },
                        ],

                        appointmentModeChartData: [
                            {
                                $group: {
                                    _id: {
                                        date: { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } },
                                    },
                                    online: {
                                        $sum: {
                                            $cond: [{ $eq: ["$appointmentMode", "Online"] }, 1, 0],
                                        },
                                    },
                                    offline: {
                                        $sum: {
                                            $cond: [{ $eq: ["$appointmentMode", "Offline"] }, 1, 0],
                                        },
                                    },
                                },
                            },
                            {
                                $project: {
                                    date: "$_id.date",
                                    online: 1,
                                    offline: 1,
                                    _id: 0,
                                },
                            },
                            { $sort: { date: 1 } },
                        ],

                        completionBreakdownChartData: [
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
                                                { case: { $eq: ["$_id", "Completed"] }, then: "completed" },
                                                { case: { $eq: ["$_id", "Not Attended"] }, then: "missed" },
                                                { case: { $eq: ["$_id", "Cancelled"] }, then: "cancelled" },
                                                { case: { $eq: ["$_id", "Rejected By Provider"] }, then: "rejected" },
                                            ],
                                            default: "other",
                                        },
                                    },
                                    value: 1,
                                    _id: 0,
                                },
                            },
                        ],

                        newVsReturningUsersChartData: [
                            { $sort: { createdAt: 1 } },
                            {
                                $group: {
                                    _id: "$userId",
                                    firstAppointmentDate: { $first: "$appointmentDate" },
                                },
                            },
                            {
                                $project: {
                                    date: {
                                        $dateToString: { format: "%Y-%m-%d", date: "$firstAppointmentDate" },
                                    },
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
                        ],

                        topBookingDaysChartData: [
                            {
                                $group: {
                                    _id: {
                                        $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" },
                                    },
                                    count: { $sum: 1 },
                                },
                            },
                            {
                                $project: {
                                    day: "$_id",
                                    count: 1,
                                    _id: 0,
                                },
                            },
                            { $sort: { count: -1 } },
                            { $limit: 5 },
                        ],
                    },
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
                    $facet: {
                        todaysBookedAppointments: [
                            { $match: { appointmentStatus: AppointmentStatus.Booked } },
                            { $count: "count" }
                        ],
                        todaysCancelledAppointments: [
                            { $match: { appointmentStatus: AppointmentStatus.Cancelled } },
                            { $count: "count" }
                        ],
                        todaysCompletedAppointments: [
                            { $match: { appointmentStatus: AppointmentStatus.Completed } },
                            { $count: "count" }
                        ],
                    }
                },
                {
                    $project: {
                        todaysBookedAppointments: { $ifNull: [{ $arrayElemAt: ["$todaysBookedAppointments.count", 0] }, 0] },
                        todaysCancelledAppointments: { $ifNull: [{ $arrayElemAt: ["$todaysCancelledAppointments.count", 0] }, 0] },
                        todaysCompletedAppointments: { $ifNull: [{ $arrayElemAt: ["$todaysCompletedAppointments.count", 0] }, 0] },
                    }
                }
            ])
            return result[0];
        } catch {
            throw new Error("Admin dashboard today booking stats fetching failed")
        }
    }
}
import { Types } from "mongoose";
import { IPayment, PaymentModel } from "./payment.model";
import { Payment } from "../../../domain/entities/payment.entity";
import { Provider } from "../../../domain/entities/provider.entity";
import { paymentForArray, paymentGatewayArray } from "../../../shared/utils/constants";
import { ProviderFetchDashboardPaymentStatsDataResponse } from "../../../application/dtos/provider.dto";
import { endOfDay, startOfDay, startOfMonth, startOfToday, startOfTomorrow } from "date-fns";
import { ApiResponse, FetchPaymentResponse, FetchPaymentsRequest, userIdAndProviderIdFilterForFetchPayments } from "../../../application/dtos/common.dto";
import { AdminFetchDashboardRevenueStatsDataResponse, AdminFetchRevenueReportRequest, AdminFetchRevenueReportResponse } from "../../../application/dtos/admin.dto";
import { AdminFetchDashboardTodayPaymentStatsDataResponse, CreatePaymentForBookingRequest, CreatePaymentForSubscriptionRequest, IPaymentRepository, UpdateBookingRequest } from "../../../domain/interfaces/repositories/IPayment.repository";

export class PaymentRepositoryImpl implements IPaymentRepository {
    private mapToEntity(payment: IPayment): Payment {
        return new Payment(
            payment._id,
            payment.transactionId,
            payment.paymentStatus,
            payment.paymentMethod,
            payment.paymentGateway,
            payment.paymentFor,
            payment.initialAmount,
            payment.discountAmount,
            payment.totalAmount,
            payment.createdAt,
            payment.updatedAt,

            payment?.userId,
            payment?.providerId,

            payment?.refundId,
            payment?.refundAmount,
            payment?.refundStatus,
            payment?.refundAt,
            payment?.refundReason,
            payment?.chargeId,
        )
    }

    async createPaymentForSubscription(payment: CreatePaymentForSubscriptionRequest, options?: { session: any }): Promise<Payment | null> {
        try {
            const newPayment = await PaymentModel.create([payment], options);
            return newPayment ? this.mapToEntity(newPayment[0]) : null;
        } catch (error) {
            console.log("createPaymentForSubscription error : ",error);
            throw new Error("Failed to create payment for subscription");
        }
    }

    async createPaymentForBooking(payment: CreatePaymentForBookingRequest, options?: { session: any }): Promise<Payment | null> {
        try {
            const newPayment = await PaymentModel.create([payment], options);
            return newPayment ? this.mapToEntity(newPayment[0]) : null;
        } catch (error) {
            console.log("createPaymentForBooking error : ",error);
            throw new Error("Failed to create payment for booking");
        }
    }

    async findAllPayments({ page, limit, userId, providerId }: FetchPaymentsRequest): Promise<ApiResponse<FetchPaymentResponse>> {
        try {
            const skip = (page - 1) * limit;
            const filter: userIdAndProviderIdFilterForFetchPayments = {};
            if (userId) {
                filter.userId = userId;
                filter.paymentFor = paymentForArray[1]
            }
            if (providerId) {
                filter.providerId = providerId;
                filter.paymentFor = { $in: [paymentForArray[2], paymentForArray[0]] }
            }
            const [payments, totalCount] = await Promise.all([
                PaymentModel.find(filter, {
                    _id: 1,
                    createdAt: 1,
                    totalAmount: 1,
                    paymentFor: 1,
                    paymentMethod: 1,
                    paymentGateway: 1,
                    paymentStatus: 1,
                    discountAmount: 1,
                }).skip(skip).limit(limit).sort({ createdAt: 1 }).lean(),
                PaymentModel.countDocuments(filter),
            ]);
            const totalPages = Math.ceil(totalCount / limit);
            return {
                data: payments.map(this.mapToEntity),
                totalPages,
                currentPage: page,
                totalCount
            }
        } catch (error) {
            console.log("findAllPayments error : ",error);
            throw new Error("Failed to find all payments");
        }
    }

    async findPaymentById(paymentId: Types.ObjectId): Promise<Payment | null> {
        try {
            const payment = await PaymentModel.findById(paymentId);
            return payment ? this.mapToEntity(payment) : null;
        } catch (error) {
            console.log("findPaymentById error : ",error);
            throw new Error("Failed to find all payments");
        }
    }

    async updateBooking(payment: UpdateBookingRequest, options: { session?: any } = {}): Promise<Payment | null> {
        try {
            const updatedPayment = await PaymentModel.findByIdAndUpdate(
                payment._id,
                { ...payment },
                { new: true, ...options }
            );
            return updatedPayment ? this.mapToEntity(updatedPayment) : null;
        } catch (error) {
            console.log("updateBooking error : ",error);
            throw new Error("Failed to update payment");
        }
    }

    async findPaymentStatsDataForProviderDashboard(providerId: Provider["_id"]): Promise<ProviderFetchDashboardPaymentStatsDataResponse> {
        try {
            const today = startOfToday();
            const tomorrow = startOfTomorrow();

            const startOfThisMonth = startOfMonth(new Date());
            const endOfToday = endOfDay(new Date());

            const result = await PaymentModel.aggregate([
                {
                    $match: {
                        providerId: providerId,
                        paymentStatus: "Paid",
                    }
                },
                {
                    $facet: {
                        totalSubscriptionPaidAmount: [
                            { $match: { paymentFor: paymentForArray[0] } },
                            {
                                $group: {
                                    _id: null,
                                    amount: { $sum: "$totalAmount" },
                                }
                            }
                        ],
                        totalEarnings: [
                            {
                                $match: {
                                    paymentFor: paymentForArray[1]
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    grossEarnings: { $sum: "$totalAmount" },
                                }
                            },
                            {
                                $project: {
                                    _id: 0,
                                    amount: {
                                        $multiply: ["$grossEarnings", 0.95],
                                    }
                                }
                            }
                        ],
                        todaysEarnings: [
                            {
                                $match: {
                                    paymentFor: paymentForArray[1],
                                    createdAt: { $gt: today, $lt: tomorrow },
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    grossEarnings: { $sum: "$totalAmount" },
                                }
                            },
                             {
                                $project: {
                                    _id: 0,
                                    amount: {
                                        $multiply: ["$grossEarnings", 0.95],
                                    }
                                }
                            }
                        ],
                        totalPayoutsMade: [
                            {
                                $match: { paymentFor: paymentForArray[2] }
                            },
                            {
                                $group: {
                                    _id: null,
                                    amount: { $sum: "$totalAmount" },
                                }
                            }
                        ],
                        pendingPayout: [
                            {
                                $match: {
                                    paymentFor: paymentForArray[1],
                                    createdAt: { $gte: startOfThisMonth, $lte: endOfToday },
                                },
                            },
                            {
                                $group: {
                                    _id: null,
                                    grossEarnings: { $sum: "$totalAmount" },
                                },
                            },
                            {
                                $project: {
                                    _id: 0,
                                    amount: {
                                        $multiply: ["$grossEarnings", 0.95],
                                    },
                                },
                            },
                        ]
                    }
                },
                {
                    $project: {
                        totalSubscriptionPaidAmount: { $ifNull: [{ $arrayElemAt: ["$totalSubscriptionPaidAmount.amount", 0] }, 0] },
                        totalEarnings: { $ifNull: [{ $arrayElemAt: ["$totalEarnings.amount", 0] }, 0] },
                        todaysEarnings: { $ifNull: [{ $arrayElemAt: ["$todaysEarnings.amount", 0] }, 0] },
                        totalPayoutsMade: { $ifNull: [{ $arrayElemAt: ["$totalPayoutsMade.amount", 0] }, 0] },
                        pendingPayout: { $ifNull: [{ $arrayElemAt: ["$pendingPayout.amount", 0] }, 0] },
                    }
                }
            ]);
            return result[0];
        } catch (error) {
            console.log("findPaymentStatsDataForProviderDashboard error : ", error);
            throw new Error("Failed to find payment stats");
        }
    }

    async findTodayPaymentStatsForAdminDashboard(): Promise<AdminFetchDashboardTodayPaymentStatsDataResponse> {
        try {

            const startOfToday = startOfDay(new Date());
            const endOfToday = endOfDay(new Date());

            const result = await PaymentModel.aggregate([
                {
                    $match: {
                        createdAt: { $gte: startOfToday, $lte: endOfToday },
                    },
                },
                {
                    $facet: {
                        todaysTotalRevenue: [
                            {
                                $match: { paymentFor: { $ne: paymentForArray[2] } }
                            },
                            {
                                $group: {
                                    _id: null,
                                    totalPaid: {
                                        $sum: {
                                            $cond: [{ $eq: ["$paymentStatus", "Paid"] }, "$totalAmount", 0],
                                        },
                                    },
                                    totalRefunded: {
                                        $sum: {
                                            $cond: [{ $eq: ["$paymentStatus", "Refunded"] }, "$refundAmount", 0],
                                        },
                                    },
                                },
                            },
                            {
                                $project: {
                                    _id: 0,
                                    amount: { $subtract: ["$totalPaid", "$totalRefunded"] },
                                },
                            },
                        ],
                        todaysTotalPayouts: [
                            {
                                $match: { payoutStatus: "Paid", paymentFor: paymentForArray[2] },
                            },
                            {
                                $group: {
                                    _id: null,
                                    amount: { $sum: "$totalAmount" },
                                },
                            },
                            {
                                $project: {
                                    _id: 0,
                                    amount: 1,
                                },
                            },
                        ]
                    }
                },
                {
                    $project: {
                        todaysTotalRevenue: { $ifNull: [{ $arrayElemAt: ["$todaysTotalRevenue.amount", 0] }, 0] },
                        todaysTotalPayouts: { $ifNull: [{ $arrayElemAt: ["$todaysTotalPayouts.amount", 0] }, 0] },
                    }
                }
            ])
            return result[0];
        } catch (error) {
            console.log("findTodayPaymentStatsForAdminDashboard error : ", error);
            throw new Error("Failed to find todays payment stats");
        }
    }

    async findPaymentStatsForAdminDashboard(): Promise<AdminFetchDashboardRevenueStatsDataResponse> {
        try {
            const paymentData = await PaymentModel.aggregate([
                {
                    $match: {
                        paymentStatus: "Paid",
                    }
                },
                {
                    $facet: {
                        totalRevenue: [
                            { $match: { paymentFor: { $in: [paymentForArray[0], paymentForArray[1]] } } },
                            {
                                $group: {
                                    _id: null,
                                    amount: { $sum: "$totalAmount" }
                                }
                            }
                        ],
                        totalRevenueViaSubscriptions: [
                            { $match: { paymentFor: paymentForArray[0]} },
                            {
                                $group: {
                                    _id: null,
                                    amount: { $sum: "$totalAmount" }
                                }
                            }
                        ],
                        totalRevenueViaAppointments: [
                            { $match: { paymentFor: paymentForArray[1] } },
                            {
                                $group: {
                                    _id: null,
                                    amount: { $sum: "$totalAmount" }
                                }
                            }
                        ],
                        revenueByStripe: [
                            { $match: { paymentGateway: paymentGatewayArray[0] } },
                            {
                                $group: {
                                    _id: null,
                                    amount: { $sum: "$totalAmount" }
                                }
                            }
                        ],
                        revenueByRazorpay: [
                            { $match: { paymentGateway: paymentGatewayArray[1] } },
                            {
                                $group: {
                                    _id: null,
                                    amount: { $sum: "$totalAmount" }
                                }
                            }
                        ],
                        revenueByPaypal: [
                            { $match: { paymentGateway: paymentGatewayArray[2] } },
                            {
                                $group: {
                                    _id: null,
                                    amount: { $sum: "$totalAmount" }
                                }
                            }
                        ],
                        totalRefundsIssued: [
                            { $match: { paymentStatus: "Refund" } },
                            {
                                $group: {
                                    _id: null,
                                    amount: { $sum: "$totalAmount" }
                                }
                            }
                        ],
                        totalFailedPayments: [
                            { $match: { paymentStatus: "Failed" } },
                            {
                                $group: {
                                    _id: null,
                                    count: { $sum: "$Count" }
                                }
                            }
                        ],
                        totalPayoutsToProviders: [
                            { $match: { PaymentFor: paymentForArray[2] } },
                            {
                                $group: {
                                    _id: null,
                                    amount: { $sum: "$totalAmount" }
                                }
                            }
                        ]
                    }
                },
                {
                    $project: {
                        totalRevenue: { $ifNull: [{ $arrayElemAt: ["$totalRevenue.amount", 0] }, 0] },
                        totalRevenueViaSubscriptions: { $ifNull: [{ $arrayElemAt: ["$totalRevenueViaSubscriptions.amount", 0] }, 0] },
                        revenueByStripe: { $ifNull: [{ $arrayElemAt: ["$revenueByStripe.amount", 0] }, 0] },
                        revenueByRazorpay: { $ifNull: [{ $arrayElemAt: ["$revenueByRazorpay.amount", 0] }, 0] },
                        revenueByPaypal: { $ifNull: [{ $arrayElemAt: ["$revenueByPaypal.amount", 0] }, 0] },
                        totalRevenueViaAppointments: { $ifNull: [{ $arrayElemAt: ["$totalRevenueViaAppointments.amount", 0] }, 0] },
                        totalRefundsIssued: { $ifNull: [{ $arrayElemAt: ["$totalRefundsIssued.amount", 0] }, 0] },
                        totalFailedPayments: { $ifNull: [{ $arrayElemAt: ["$totalFailedPayments.count", 0] }, 0] },
                        totalPayoutsToProviders: { $ifNull: [{ $arrayElemAt: ["$totalPayoutsToProviders.amount", 0] }, 0] },
                    }
                }
            ])
            return paymentData[0];
        } catch (error) {
            console.log("findPaymentStatsForAdminDashboard error : ", error);
            throw new Error("Failed to find payment stats")
        }
    }

    async findAdminRevenueReport(payload: AdminFetchRevenueReportRequest): Promise<ApiResponse<AdminFetchRevenueReportResponse>> {
        try {

            const { endDate, limit, page, startDate } = payload;
            const skip = (page - 1) * limit;
            const match: Record<string, any> = {
                paymentStatus: "Paid",
                paymentFor: { $in: [paymentForArray[0], paymentForArray[1]] },
            };

            if (startDate || endDate) {
                match.createdAt = {};
                if (startDate) match.createdAt.$gte = startDate;
                if (endDate) match.createdAt.$lte = endDate;
            }

            const revenueReportData = await PaymentModel.aggregate([
                { $match: match },

                {
                    $facet: {
                        rows: [
                            { $sort: { createdAt: -1 } },
                            { $skip: skip },
                            { $limit: limit },
                            {
                                $project: {
                                    _id: 0,
                                    createdAt: 1,
                                    discountAmount: 1,
                                    initialAmount: 1,
                                    totalAmount: 1,
                                    paymentGateway: 1,
                                    paymentFor: 1,
                                },
                            },
                        ],

                        grandTotals: [
                            { $sort: { createdAt: -1 } },
                            { $skip: skip },
                            { $limit: limit },

                            {
                                $group: {
                                    _id: null,
                                    grandTotal: { $sum: "$totalAmount" },
                                    grandDiscount: { $sum: "$discountAmount" },
                                    grandInitalAmount: { $sum: "$initialAmount" },
                                },
                            },
                        ],
                    },
                },

                {
                    $project: {
                        rows: 1,
                        grandTotal: { $ifNull: [{ $arrayElemAt: ["$grandTotals.grandTotal", 0] }, 0] },
                        grandDiscount: { $ifNull: [{ $arrayElemAt: ["$grandTotals.grandDiscount", 0] }, 0] },
                        grandInitalAmount: { $ifNull: [{ $arrayElemAt: ["$grandTotals.grandInitalAmount", 0] }, 0] },
                    },
                },
            ]).allowDiskUse(true);

            const totalCount = await PaymentModel.countDocuments(match);
            const totalPages = Math.ceil(totalCount / limit);

            return {
                data: {
                    rows: revenueReportData[0].rows,
                    grandTotal: revenueReportData[0].grandTotal,
                    grandDiscount: revenueReportData[0].grandDiscount,
                    grandInitalAmount: revenueReportData[0].grandInitalAmount,
                },
                totalPages,
                currentPage: page,
                totalCount,
            };
        } catch (error) {
            console.log("findAdminRevenueReport error : ", error);
            throw new Error("Failed to find revenue repost");
        }
    }
}
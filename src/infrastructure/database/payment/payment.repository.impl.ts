import { Types } from "mongoose";
import { IPayment, PaymentModel } from "./payment.model";
import { Provider } from "../../../domain/entities/provider.entity";
import { AdminFetchDashboardRevenueStatsDataResponse, AdminFetchRevenueReportRequest, AdminFetchRevenueReportResponse } from "../../dtos/admin.dto";
import { ProviderFetchDashboardPaymentStatsDataResponse } from "../../dtos/provider.dto";
import { endOfDay, startOfDay, startOfMonth, startOfToday, startOfTomorrow } from "date-fns";
import { Payment, PaymentFor, PaymentGateway } from "../../../domain/entities/payment.entity";
import { ApiResponse, FetchPaymentResponse, FetchPaymentsRequest, userIdAndProviderIdFilterForFetchPayments } from "../../dtos/common.dto";
import { AdminFetchDashboardTodayPaymentStatsDataResponse, CreatePaymentForBookingProps, CreatePaymentForSubscriptionProps, fetchDatashboardStatsParams, IPaymentRepository, UpdateForCancelBookingRefundReqProps } from "../../../domain/repositories/IPayment.repository";

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

    async createPaymentForSubscription(payment: CreatePaymentForSubscriptionProps, options: { session?: any } = {}): Promise<Payment | null> {
        try {
            const newPayment = await PaymentModel.create([payment], options);
            return newPayment ? this.mapToEntity(newPayment[0]) : null;
        } catch (error) {
            throw new Error("Payment creation error.");
        }
    }

    async createPaymentForBooking(payment: CreatePaymentForBookingProps, options: { session?: any } = {}): Promise<Payment | null> {
        try {
            const newPayment = await PaymentModel.create([payment], options);
            return newPayment ? this.mapToEntity(newPayment[0]) : null;
        } catch (error) {
            throw new Error("Payment creation error.");
        }
    }

    async findAllPayments({ page, limit, userId, providerId }: FetchPaymentsRequest): Promise<ApiResponse<FetchPaymentResponse>> {
        try {
            const skip = (page - 1) * limit;
            const filter: userIdAndProviderIdFilterForFetchPayments = {};
            if (userId) {
                filter.userId = userId;
                filter.paymentFor = PaymentFor.AppointmentBooking
            }
            if (providerId) {
                filter.providerId = providerId;
                filter.paymentFor = { $in: [PaymentFor.ProviderPayout, PaymentFor.ProviderSubscription] }
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
            throw new Error("Payments fetching error.");
        }
    }

    async findPaymentById(paymentId: Types.ObjectId): Promise<Payment | null> {
        try {
            const payment = await PaymentModel.findById(paymentId);
            return payment ? this.mapToEntity(payment) : null;
        } catch (error) {
            throw new Error("Payment fetching error");
        }
    }

    async updateForCancelBookingRefund(payment: UpdateForCancelBookingRefundReqProps, options: { session?: any } = {}): Promise<Payment | null> {
        try {
            const updatedPayment = await PaymentModel.findByIdAndUpdate(
                payment._id,
                { ...payment },
                { new: true, ...options }
            );
            return updatedPayment ? this.mapToEntity(updatedPayment) : null;
        } catch (error) {
            throw new Error("Payment updating error");
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
                            { $match: { paymentFor: PaymentFor.ProviderSubscription } },
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
                                    PaymentFor: PaymentFor.AppointmentBooking
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    amount: { $sum: "$totalAmount" },
                                }
                            }
                        ],
                        todaysEarnings: [
                            {
                                $match: {
                                    paymentFor: PaymentFor.AppointmentBooking,
                                    createdAt: { $gt: today, $lt: tomorrow },
                                }
                            },
                            {
                                $group: {
                                    _id: null,
                                    amount: { $sum: "$totalAmount" },
                                }
                            }
                        ],
                        totalPayoutsMade: [
                            {
                                $match: { paymentFor: PaymentFor.ProviderPayout }
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
                                    paymentFor: PaymentFor.AppointmentBooking,
                                    paymentStatus: "Paid",
                                    providerId: providerId,
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
            console.log("Dashboard payment stats fetching failed : ", error);
            throw new Error("Dashboard payment stats fetching failed")
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
                                $match: { paymentFor: { $ne: PaymentFor.ProviderPayout } }
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
                                $match: { payoutStatus: "Paid", paymentFor: PaymentFor.ProviderPayout },
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
            console.log("findTodayPaymentStatsForAdminDashboard from repository : ", error);
            throw new Error("Admin dashboard today payment stats fetching failed")
        }
    }

    async fetchPaymentStatsForAdminDashboard(): Promise<AdminFetchDashboardRevenueStatsDataResponse> {
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
                            { $match: { paymentFor: { $in: [PaymentFor.ProviderSubscription, PaymentFor.AppointmentBooking] } } },
                            {
                                $group: {
                                    _id: null,
                                    amount: { $sum: "$totalAmount" }
                                }
                            }
                        ],
                        totalRevenueViaSubscriptions: [
                            { $match: { paymentFor: PaymentFor.ProviderSubscription } },
                            {
                                $group: {
                                    _id: null,
                                    amount: { $sum: "$totalAmount" }
                                }
                            }
                        ],
                        totalRevenueViaAppointments: [
                            { $match: { paymentFor: PaymentFor.AppointmentBooking } },
                            {
                                $group: {
                                    _id: null,
                                    amount: { $sum: "$totalAmount" }
                                }
                            }
                        ],
                        revenueByStripe: [
                            { $match: { paymentGateway: PaymentGateway.Stripe } },
                            {
                                $group: {
                                    _id: null,
                                    amount: { $sum: "$totalAmount" }
                                }
                            }
                        ],
                        revenueByRazorpay: [
                            { $match: { paymentGateway: PaymentGateway.Razorpay } },
                            {
                                $group: {
                                    _id: null,
                                    amount: { $sum: "$totalAmount" }
                                }
                            }
                        ],
                        revenueByPaypal: [
                            { $match: { paymentGateway: PaymentGateway.Paypal } },
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
                            { $match: { PaymentFor: PaymentFor.ProviderPayout } },
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
            console.log("fetchPaymentStatsForAdminDashboard from repository : ", error);
            throw new Error("Admin dashboard payment stats fetching failed")
        }
    }

    async fetchAdminRevenueReport(payload: AdminFetchRevenueReportRequest): Promise<ApiResponse<AdminFetchRevenueReportResponse>> {
        try {

            const { endDate, limit, page, startDate } = payload;
            const skip = (page - 1) * limit;
            const match: Record<string, any> = {
                paymentStatus: "Paid",
                paymentFor: { $in: [PaymentFor.ProviderSubscription, PaymentFor.AppointmentBooking] },
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
                                    paymentMethod: 1,
                                    paymentStatus: 1,
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
            console.log("fetchAdminRevenueReport error : ", error);
            throw new Error("Admin revenue report fetching failed");
        }
    }
}
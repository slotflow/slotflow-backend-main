import { Types } from "mongoose";
import { PaymentModel } from "../database/payment.model";
import { TableData } from "../../application/dtos/common.dto";
import { PaymentFor } from "../../domain/enums/paymentFor.enum";
import { PaymentStatus } from "../../domain/enums/paymentStatus.enum";
import { PaymentGateway } from "../../domain/enums/paymentGateway.enum";
import { IPaymentQueries } from "../../application/queries/IPayment.queries";
import { endOfDay, startOfDay, startOfMonth, startOfToday, startOfTomorrow } from "date-fns";
import { ProviderFetchDashboardPaymentStatsDataResponse } from "../../application/dtos/provider.dto";
import { AdminFetchDashboardRevenueStatsDataResponse, AdminFetchDashboardTodayPaymentStatsDataResponse, AdminFetchRevenueReportRequest, AdminFetchRevenueReportResponse } from "../../application/dtos/admin.dto";

export class PaymentQueriesImpl implements IPaymentQueries {

    async findAdminRevenueReport(payload: AdminFetchRevenueReportRequest): Promise<TableData<AdminFetchRevenueReportResponse>> {
        const { endDate, limit, page, startDate } = payload;
        const skip = (page - 1) * limit;
        const match: Record<string, any> = {
            paymentStatus: PaymentStatus.Paid,
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
    };

    async findStatsDataForAdminDashboard(): Promise<AdminFetchDashboardRevenueStatsDataResponse> {
        const paymentData = await PaymentModel.aggregate([
            {
                $match: {
                    paymentStatus: PaymentStatus.Paid,
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
                        { $match: { paymentGateway: PaymentGateway.Razorpay } },
                        {
                            $group: {
                                _id: null,
                                amount: { $sum: "$totalAmount" }
                            }
                        }
                    ],
                    totalRefundsIssued: [
                        { $match: { paymentStatus: PaymentStatus.Refunded } },
                        {
                            $group: {
                                _id: null,
                                amount: { $sum: "$totalAmount" }
                            }
                        }
                    ],
                    totalFailedPayments: [
                        { $match: { paymentStatus: PaymentStatus.Failed } },
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
        ]);

        const data = paymentData[0];
        return { ...data};
    };

    async findStatsDataForProviderDashboard(providerId: string): Promise<ProviderFetchDashboardPaymentStatsDataResponse> {
        const today = startOfToday();
        const tomorrow = startOfTomorrow();

        const startOfThisMonth = startOfMonth(new Date());
        const endOfToday = endOfDay(new Date());

        const result = await PaymentModel.aggregate([
            {
                $match: {
                    providerId: new Types.ObjectId(providerId),
                    paymentStatus: PaymentStatus.Paid,
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
                                paymentFor: PaymentFor.AppointmentBooking
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
                                paymentFor: PaymentFor.AppointmentBooking,
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

        const data = result[0];
        return {...data};
    };

    async findTodayStatsDataForAdminDashboard(): Promise<AdminFetchDashboardTodayPaymentStatsDataResponse> {
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
        ]);

        const data = result[0];
        return {...data};
    };

}
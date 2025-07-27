import { Types } from "mongoose";
import { IPayment, PaymentModel } from "./payment.model";
import { Provider } from "../../../domain/entities/provider.entity";
import { Payment, PaymentFor } from "../../../domain/entities/payment.entity";
import { endOfDay, startOfMonth, startOfToday, startOfTomorrow } from "date-fns";
import { ProviderFetchDashboardPaymentStatsDataResponse } from "../../dtos/provider.dto";
import { ApiResponse, FetchPaymentResponse, FetchPaymentsRequest, userIdAndProviderId } from "../../dtos/common.dto";
import { CreatePaymentForBookingProps, CreatePaymentForSubscriptionProps, IPaymentRepository, UpdateForCancelBookingRefundReqProps } from "../../../domain/repositories/IPayment.repository";

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
            const filter: userIdAndProviderId = {};
            if (userId) { filter.userId = userId; }
            if (providerId) { filter.providerId = providerId; }
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
                PaymentModel.countDocuments(),
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

    async findPaymentStatsDataForDashboard(providerId: Provider["_id"]): Promise<ProviderFetchDashboardPaymentStatsDataResponse> {
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
        } catch {
            throw new Error("Dashboard payment stats fetching error ")
        }
    }
}
import dayjs from "dayjs";
import mongoose from "mongoose";
import { CreditAccountModel } from "../models/creditAccount.model";
import { CreditTransactionModel } from "../models/creditTransaction.model";
import { ICreditAccountQueries } from "../../application/queries/ICreditAccount.queries";
import { CreditTransactionStatus, CreditTransactionType } from "../../domain/enums/creditTransaction.enum";
import { GetCreditAccountDetailsQuery, GetCreditAccountDetailsView } from "../../application/dtos/credits.dto";

export class CreditAccountQueriesImpl implements ICreditAccountQueries {

    async findCreditAccountDetailsWithGraphData(
        query: GetCreditAccountDetailsQuery
    ): Promise<GetCreditAccountDetailsView> {

        const { userId } = query;

        const userObjectId = new mongoose.Types.ObjectId(userId);

        const account = await CreditAccountModel.findOne({ userId: userObjectId });

        if (!account) {
            throw new Error("Credit account not found");
        }

        const sixMonthsAgo = dayjs().subtract(5, "month").startOf("month").toDate();

        const aggregation = await CreditTransactionModel.aggregate([

            {
                $match: {
                    userId: userObjectId,
                    status: CreditTransactionStatus.SUCCESS
                }
            },

            {
                $facet: {

                    totalCredits: [
                        { $match: { type: CreditTransactionType.CREDIT } },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: "$credits" }
                            }
                        }
                    ],

                    spentCredits: [
                        { $match: { type: CreditTransactionType.DEBIT } },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: "$credits" }
                            }
                        }
                    ],

                    chartData: [
                        {
                            $match: {
                                createdAt: { $gte: sixMonthsAgo },
                                type: CreditTransactionType.CREDIT
                            }
                        },
                        {
                            $group: {
                                _id: {
                                    year: { $year: "$createdAt" },
                                    month: { $month: "$createdAt" }
                                },
                                totalCredits: { $sum: "$credits" }
                            }
                        },
                        {
                            $sort: {
                                "_id.year": 1,
                                "_id.month": 1
                            }
                        }
                    ]
                }
            }
        ]);

        const agg = aggregation[0];

        const totalCredits = agg.totalCredits[0]?.total || 0;
        const spentCredits = agg.spentCredits[0]?.total || 0;
        const chartMap = new Map<string, number>();

        for (let i = 0; i < 6; i++) {
            const date = dayjs().subtract(5 - i, "month").startOf("month");
            const key = date.format("YYYY-MM");
            chartMap.set(key, 0);
        }

        agg.chartData.forEach((item: any) => {
            const key = `${item._id.year}-${String(item._id.month).padStart(2, "0")}`;
            chartMap.set(key, item.totalCredits);
        });

        const chartData = Array.from(chartMap.entries()).map(([key, value]) => ({
            date: `${key}-01`,
            credits: value
        }));

        return {
            isActive: account.isActive,
            balance: account.balance,
            totalCredits,
            spentCredits,
            chartData
        };
    }
}
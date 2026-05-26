import mongoose from "mongoose";
import {
    CreditChartKeys,
    CreditMainChartData,
    GetCreditAccountDetailsView,
    GetCreditAccountDetailsQuery,
} from "../../application/dtos/credits.dto";
import { calcPercentage } from "../../shared/utils/getPercentage";
import { CreditAccountModel } from "../models/creditAccount.model";
import { AggregateCountResult } from "../../application/dtos/common.dto";
import { CreditTransactionModel } from "../models/creditTransaction.model";
import { getDateRangeMetrics } from "../../shared/utils/getDateRangeMetrics";
import { ICreditAccountQueries } from "../../application/queries/ICreditAccount.queries";
import { CreditTransactionStatus, CreditTransactionType } from "../../domain/enums/creditTransaction.enum";

export class CreditAccountQueriesImpl implements ICreditAccountQueries {
  async findCreditDetails(query: GetCreditAccountDetailsQuery): Promise<GetCreditAccountDetailsView> {
    const { userId, startDate, endDate } = query;
    const { days, start, end, prevStart, prevEnd } = getDateRangeMetrics(startDate, endDate);
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const account = await CreditAccountModel.findOne({
      userId: userObjectId,
    }).lean();

    const isActive = account?.isActive ?? false;
    const currentBalance = account?.balance ?? 0;

    const currentAgg = await CreditTransactionModel.aggregate([
      {
        $match: {
          userId: userObjectId,
          status: CreditTransactionStatus.SUCCESS,
          createdAt: {
            $gte: start.toDate(),
            $lte: end.toDate(),
          },
        },
      },
      {
        $facet: {
          totalCredits: [
            { $match: { type: CreditTransactionType.CREDIT } },
            { $group: { _id: null, count: { $sum: "$credits" } } },
          ],
          spentCredits: [
            { $match: { type: CreditTransactionType.DEBIT } },
            { $group: { _id: null, count: { $sum: "$credits" } } },
          ],
        },
      },
    ]);

    const prevAgg = await CreditTransactionModel.aggregate([
      {
        $match: {
          userId: userObjectId,
          status: CreditTransactionStatus.SUCCESS,
          createdAt: {
            $gte: prevStart.toDate(),
            $lte: prevEnd.toDate(),
          },
        },
      },
      {
        $facet: {
          totalCredits: [
            { $match: { type: CreditTransactionType.CREDIT } },
            { $group: { _id: null, count: { $sum: "$credits" } } },
          ],
          spentCredits: [
            { $match: { type: CreditTransactionType.DEBIT } },
            { $group: { _id: null, count: { $sum: "$credits" } } },
          ],
        },
      },
    ]);

    const getValue = (arr: AggregateCountResult[]): number => arr[0]?.count ?? 0;

    const current = currentAgg[0];
    const previous = prevAgg[0];

    const totalCurrent = getValue(current.totalCredits);
    const totalPrev = getValue(previous.totalCredits);

    const spentCurrent = getValue(current.spentCredits);
    const spentPrev = getValue(previous.spentCredits);

    const balanceCurrent = totalCurrent - spentCurrent;
    const balancePrev = totalPrev - spentPrev;

    const chartAgg = await CreditTransactionModel.aggregate([
        {
          $match: {
            userId: userObjectId,
            status: CreditTransactionStatus.SUCCESS,
            createdAt: {
              $gte: start.toDate(),
              $lte: end.toDate(),
            },
          },
        },
        {
          $group: {
            _id: {
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$createdAt",
                },
              },
            },
            totalCredits: {
              $sum: {
                $cond: [
                  { $eq: ["$type", CreditTransactionType.CREDIT] },
                  "$credits",
                  0,
                ],
              },
            },
            spentCredits: {
              $sum: {
                $cond: [
                  { $eq: ["$type", CreditTransactionType.DEBIT] },
                  "$credits",
                  0,
                ],
              },
            },
          },
        },
        {
          $addFields: {
            balanceCredits: {
              $subtract: ["$totalCredits", "$spentCredits"],
            },
          },
        },
        {
          $sort: { "_id.date": 1 },
        },
      ]);

    const rawChartData: CreditMainChartData[] = chartAgg.map((item) => ({
      date: item._id.date,
      totalCredits: item.totalCredits,
      spentCredits: item.spentCredits,
      balanceCredits: item.balanceCredits,
    }));

    const dateMap = new Map(
      rawChartData.map((d) => [d.date, d])
    );

    const filledChartData: CreditMainChartData[] = [];

    let currentDate = start;

    while (currentDate.isBefore(end) || currentDate.isSame(end)) {
      const dateStr = currentDate.format("YYYY-MM-DD");

      filledChartData.push(
        dateMap.get(dateStr) || {
          date: dateStr,
          totalCredits: 0,
          spentCredits: 0,
          balanceCredits: 0,
        }
      );

      currentDate = currentDate.add(1, "day");
    }

    const buildMiniChart = (key: CreditChartKeys) => {
      return filledChartData.map((item) => ({
        date: item.date,
        value: item[key],
      }));
    };

    return {
      isActive,

      totalCredits: {
        count: totalCurrent,
        percentage: calcPercentage(totalCurrent, totalPrev),
        days,
        chartData: buildMiniChart("totalCredits"),
      },

      spentCredits: {
        count: spentCurrent,
        percentage: calcPercentage(spentCurrent, spentPrev),
        days,
        chartData: buildMiniChart("spentCredits"),
      },

      balanceCredits: {
        count: currentBalance, // 🔥 real balance from account
        percentage: calcPercentage(balanceCurrent, balancePrev),
        days,
        chartData: buildMiniChart("balanceCredits"),
      },

      chartData: filledChartData,
    };
  }
}
import mongoose from "mongoose";
import {
  ReferralChartKeys,
  GetReferralDetailsView,
  GetReferralDetailsQuery,
} from "../../application/dtos/referral.dto";
import { addDays, isBefore, isSameDay } from "date-fns";
import { formatDate } from "../../shared/utils/helpers/formatDate";
import { ReferralModel } from "../models/referral.model";
import { calcPercentage } from "../../shared/utils/helpers/getPercentage";
import { dateFormats, defaultTimezone } from "../../shared/utils/constants/constant";
import { AggregateCountResult } from "../../application/dtos/common.dto";
import { getDateRangeMetrics } from "../../shared/utils/helpers/getDateRangeMetrics";
import { IReferralQueries } from "../../application/interfaces/queries/IReferral.queries";

export class ReferralQueriesImpl implements IReferralQueries {
  async findReferralDetails(query: GetReferralDetailsQuery): Promise<GetReferralDetailsView> {
    const { userId, startDate, endDate, timeZone } = query;
    const effectiveTimeZone = timeZone || defaultTimezone;

    const { days, end, prevEnd, prevStart, start } = getDateRangeMetrics({
      startDate,
      endDate,
      timeZone: effectiveTimeZone,
    });

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const currentAgg = await ReferralModel.aggregate([
      {
        $match: {
          referrerUserId: userObjectId,
          createdAt: {
            $gte: start,
            $lte: end,
          },
        },
      },
      {
        $facet: {
          total: [{ $count: "count" }],
          completed: [{ $match: { status: "COMPLETED" } }, { $count: "count" }],
          pending: [{ $match: { status: "PENDING" } }, { $count: "count" }],
          rewarded: [
            {
              $match: {
                rewardGiven: true,
                status: "COMPLETED",
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]);

    const prevAgg = await ReferralModel.aggregate([
      {
        $match: {
          referrerUserId: userObjectId,
          createdAt: {
            $gte: prevStart,
            $lte: prevEnd,
          },
        },
      },
      {
        $facet: {
          total: [{ $count: "count" }],
          completed: [{ $match: { status: "COMPLETED" } }, { $count: "count" }],
          pending: [{ $match: { status: "PENDING" } }, { $count: "count" }],
          rewarded: [
            {
              $match: {
                rewardGiven: true,
                status: "COMPLETED",
              },
            },
            { $count: "count" },
          ],
        },
      },
    ]);

    const getCount = (arr: AggregateCountResult[]) => arr[0]?.count ?? 0;

    const current = currentAgg[0];
    const previous = prevAgg[0];

    const totalCurrent = getCount(current.total);
    const totalPrev = getCount(previous.total);

    const completedCurrent = getCount(current.completed);
    const completedPrev = getCount(previous.completed);

    const pendingCurrent = getCount(current.pending);
    const pendingPrev = getCount(previous.pending);

    const rewardedCurrent = getCount(current.rewarded);
    const rewardedPrev = getCount(previous.rewarded);

    const chartAgg = await ReferralModel.aggregate([
      {
        $match: {
          referrerUserId: userObjectId,
          createdAt: {
            $gte: start,
            $lte: end,
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
                timezone: effectiveTimeZone,
              },
            },
          },
          totalReferrals: { $sum: 1 },
          completedReferrals: {
            $sum: {
              $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0],
            },
          },
          pendingReferrals: {
            $sum: {
              $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0],
            },
          },
          rewardedReferrals: {
            $sum: {
              $cond: [
                {
                  $and: [{ $eq: ["$rewardGiven", true] }, { $eq: ["$status", "COMPLETED"] }],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      {
        $sort: { "_id.date": 1 },
      },
    ]);

    const rawChartData = chartAgg.map((item) => ({
      date: item._id.date,
      totalReferrals: item.totalReferrals,
      completedReferrals: item.completedReferrals,
      pendingReferrals: item.pendingReferrals,
      rewardedReferrals: item.rewardedReferrals,
    }));

    const dateMap = new Map(rawChartData.map((item) => [item.date, item]));

    const filledChartData: typeof rawChartData = [];

    let currentDate = start;

    while (isBefore(currentDate, end) || isSameDay(currentDate, end)) {
      const dateStr = formatDate({
        date: currentDate,
        pattern: dateFormats.ISO_DATE,
        timeZone,
      });

      filledChartData.push(
        dateMap.get(dateStr) || {
          date: dateStr,
          totalReferrals: 0,
          completedReferrals: 0,
          pendingReferrals: 0,
          rewardedReferrals: 0,
        },
      );

      currentDate = addDays(currentDate, 1);
    }

    const buildMiniChart = (key: ReferralChartKeys) => {
      return filledChartData.map((item) => ({
        date: item.date,
        value: item[key],
      }));
    };

    return {
      totalReferrals: {
        count: totalCurrent,
        percentage: calcPercentage(totalCurrent, totalPrev),
        days,
        chartData: buildMiniChart("totalReferrals"),
      },

      completedReferrals: {
        count: completedCurrent,
        percentage: calcPercentage(completedCurrent, completedPrev),
        days,
        chartData: buildMiniChart("completedReferrals"),
      },

      pendingReferrals: {
        count: pendingCurrent,
        percentage: calcPercentage(pendingCurrent, pendingPrev),
        days,
        chartData: buildMiniChart("pendingReferrals"),
      },

      rewardedReferrals: {
        count: rewardedCurrent,
        percentage: calcPercentage(rewardedCurrent, rewardedPrev),
        days,
        chartData: buildMiniChart("rewardedReferrals"),
      },

      chartData: filledChartData,
    };
  }
}

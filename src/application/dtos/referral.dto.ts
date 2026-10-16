import { CommonDateInput, MiniCardData } from "./common.dto";
import { ReferralStatus } from "../../domain/enums/common.enum";
import { UserProps } from "../../domain/contracts/user.contract";
import { ReferralProps } from "../../domain/contracts/referral.contract";

/**
 * Referral queries dtos
 */

// findReferralDetails query and view
export interface GetReferralDetailsQuery extends CommonDateInput {
  userId: UserProps["_id"];
  timeZone: string;
}
export interface MainChartData {
  date: string;
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
  rewardedReferrals: number;
}
export interface GetReferralDetailsView {
  totalReferrals: MiniCardData;
  completedReferrals: MiniCardData;
  pendingReferrals: MiniCardData;
  rewardedReferrals: MiniCardData;
  chartData: MainChartData[];
}
export type ReferralChartKeys =
  "totalReferrals" | "completedReferrals" | "pendingReferrals" | "rewardedReferrals";

/**
 * Referral usecase dtos
 */

// getReferralDetails
export type GetReferralDetailsInput = GetReferralDetailsQuery;
export type GetReferralDetailsOutput = GetReferralDetailsView;

// getReferralsList
export interface GetReferralListInput {
  page: number;
  limit: number;
  referrerUserId: UserProps["_id"];
  status?: ReferralStatus;
}
export type GetReferralsListOutput = Pick<
  ReferralProps,
  "_id" | "status" | "createdAt" | "completedAt" | "rewardGiven"
>;

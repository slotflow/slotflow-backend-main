import { ReferralStatus } from "../../domain/enums/common.enum";
import { MiniCardData, ReferralDTO, UserDTO } from "./common.dto";

//

// queries

// findReferralDetails query and view
export interface GetReferralDetailsQuery {
    userId: UserDTO["_id"];
    startDate: Date;
    endDate: Date;
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
    | "totalReferrals"
    | "completedReferrals"
    | "pendingReferrals"
    | "rewardedReferrals";






// usecases

// getReferralDetails usecase inpout and output
export type GetReferralDetailsInput = GetReferralDetailsQuery;
export type GetReferralDetailsOutput = GetReferralDetailsView;

// getReferralsList usecase input and output
export interface GetReferralListInput {
    page: number;
    limit: number;
    referrerUserId: UserDTO["_id"];
    status?: ReferralStatus;
}
export type GetReferralsListOutput = Pick<ReferralDTO, "_id" | "status" | "createdAt" | "completedAt" | "rewardGiven">
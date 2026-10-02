import { PlanName } from "../../domain/enums/plan.enum";
import { UserProps } from "../../domain/contracts/user.contract";
import { BookingStatsForProviderView } from "./booking.dto";
import { CommonDateInput } from "./common.dto";

/**
 * Provider usecase dtos
 */

// GetProviderStats usecase input output
export interface GetProviderStatsInput extends CommonDateInput {
    providerId: UserProps["_id"];
    timeZone: string;
}
export type GetProviderStatsOutput = BookingStatsForProviderView;


// GetProviderGraphData usecase input output
export interface GetProviderGraphDataInput extends CommonDateInput {
    providerId: UserProps["_id"];
    subscription: PlanName;
    isAdmin: boolean;
    timeZone: string;
}
export interface GetProviderGraphDataOutput {
    appointmentsOvertimeChartData: Array<{
        date: string;
        completed: number;
        missed: number;
        cancelled: number;
    }>;

    peakBookingHoursChartData: Array<{
        date: string;
        hour: string;
        bookings: number;
    }>;

    appointmentModeChartData: Array<{
        date: string;
        online: number;
        offline: number;
    }>;

    completionBreakdownChartData: Array<{
        status: 'completed' | 'missed' | 'cancelled' | 'rejected' | "confirmed" | "booked" | "pending";
        value: number;
    }>;

    newVsReturningUsersChartData: Array<{
        date: string;
        newUsers: number;
        returningUsers: number;
    }>;

    topBookingDaysChartData: Array<{
        day: string;
        count: number;
    }>;
}







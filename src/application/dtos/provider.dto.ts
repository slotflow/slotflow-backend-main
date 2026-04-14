import { PlanName } from "../../domain/enums/plan.enum";
import { SubscriptionDTO, UserDTO } from "./common.dto";

// provider get stats use case request payload interface
export interface GetProviderStatsInput {
    providerId: UserDTO["_id"];
    startDate: Date;
    endDate: Date;
}
export interface GetProviderStatsOutput {
    totalAppointments: number;
    completedAppointments: number;
    missedAppointments: number;
    cancelledAppointmentsByUser: number;
    rejectedAppointmentsByProvider: number;
    todaysAppointments: number;
}

// provider get graph data use case request payload interface
export interface GetProviderGraphDataInput {
    providerId: UserDTO["_id"];
    subscription: PlanName;
    startDate?: Date;
    endDate?: Date;
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
        status: 'completed' | 'missed' | 'cancelled' | 'rejected' | "confirmed" | "booked";
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







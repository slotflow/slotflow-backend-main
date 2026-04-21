import { UserDTO } from "./common.dto";
import { PlanName } from "../../domain/enums/plan.enum";

//// **** provider dtos **** ////

// GetProviderStats usecase input output
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

// GetProviderGraphData usecase input output
export interface GetProviderGraphDataInput {
    providerId: UserDTO["_id"];
    subscription: PlanName;
    startDate: Date;
    endDate: Date;
    isAdmin: boolean;
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







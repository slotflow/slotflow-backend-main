import { Types } from "mongoose";
import { Plan } from "../../domain/entities/plan.entity";
import { User } from "../../domain/entities/user.entity";
import { Credential } from "../../domain/entities/credential";
import { Address } from "../../domain/entities/address.entity";
import { Booking } from "../../domain/entities/booking.entity";
import { Service } from "../../domain/entities/service.entity";
import { Provider } from "../../domain/entities/provider.entity";
import { Subscription } from "../../domain/entities/subscription.entity";
import { Payment, PaymentFor } from "../../domain/entities/payment.entity";
import { findSubscriptionFullDetailsResProps } from "../../domain/repositories/ISubscription.repository";
import { ServiceAvailability } from "../../domain/entities/serviceAvailability.entity";

// Common Role
export enum Role {
  admin = "ADMIN",
  user = "USER",
  provider = "PROVIDER"
}

// **** 1. Used as the request interface for the paginated request
export interface ApiPaginationRequest {
  page: number;
  limit: number;
}


// **** 2. Used as the response interface for the all request
export interface CommonResponse {
  success?: boolean;
  message?: string;
};


// **** 3. Used as the response interface for the paginated response
export interface ApiResponse<T = unknown> extends CommonResponse {
  totalPages?: number;
  currentPage?: number;
  totalCount?: number;
  data?: T;
}


//// **** 4.1 Used as the request interface for fetching subscriptions with planName and plan price of a specific provider for the provider side and admin side
export interface FetchProviderSubscriptionsRequest extends ApiPaginationRequest {
  providerId: Provider["_id"];
}
//// **** 4.2 Used as the response type for fetching subscriptions with planName and plan price of a specific provider for the provider side and admin side
export type FindSubscriptionsByProviderIdResponse = Array<
  Pick<Subscription, "_id" | "startDate" | "endDate" | "subscriptionStatus"> &
  Partial<Pick<Plan, "planName">>> &
  Partial<Pick<Payment, "totalAmount">>;
export type PopulatedSubscription = Omit<Subscription, 'subscriptionPlanId' | "paymentId"> & {
  subscriptionPlanId: {
    planName: string;
  },
  paymentId: {
    totalAmount: string;
  }
};



//// **** 5. Used as the request type for adding address for user or provider
export type AddAddressRequest = Pick<Address, "userId" | "addressLine" | "place" | "phone" | "city" | "country" | "district" | "pincode" | "state" | "googleMapLink">;


//// **** 6.1 Used as the request interface fetching payments for admin, provider and user side
export interface userIdAndProviderId {
  userId?: User["_id"];
  providerId?: Provider["_id"];
  paymentFor?: PaymentFor | { $in: PaymentFor[] };
}
export interface FetchPaymentsRequest extends ApiPaginationRequest, userIdAndProviderId { }
//// **** 6.1 Used as the response type fetching payments for admin, provider and user side
export type FetchPaymentResponse = Array<Pick<Payment, "_id" | "createdAt" | "totalAmount" | "paymentFor" | "paymentGateway" | "paymentStatus" | "paymentMethod" | "discountAmount">>;



//// **** 7.1 Used as the request interface for fetching bookings for admin, provider and user side
export interface userIdAndServiceProviderId {
  userId?: User["_id"];
  serviceProviderId?: Provider["_id"];
}
export interface FetchBookingsRequest extends ApiPaginationRequest, userIdAndServiceProviderId {
  online: boolean;
  raw: boolean;
  role: Role;
}
//// **** 7.2 Used as the response type for fetching bookings for admin, provider and user side
export type FetchBookingsResponse = Array<Pick<Booking, "_id" | "appointmentDate" | "appointmentMode" | "appointmentStatus" | "appointmentTime" | "createdAt" | "videoCallRoomId">>;
export type FetchOnlineBookingsForProviderResponse = Array<Pick<Booking, "_id" | "appointmentDate" | "appointmentStatus" | "appointmentTime" | "videoCallRoomId" | "createdAt"> & Pick<User, "username">>;
export type FetchOnlineBookingsForUserResponse = Pick<Booking, "_id" | "appointmentDate" | "appointmentStatus" | "appointmentTime" | "videoCallRoomId" | "createdAt"> & Pick<Provider, "username">;

//// **** 8. Used as the response type for fetching AppServices for provider and user side
export type FetchAllAppServicesResponse = Array<Pick<Service, "_id" | "serviceName">>;

//// **** 9. Used as the request type for updating address for provider and user side
export type UpdateAddressRequest = Pick<Address, "_id" | "userId" | "addressLine" | "place" | "phone" | "city" | "country" | "district" | "pincode" | "state" | "googleMapLink">;

//// **** 10. Used as the interface for the validate join room
export interface ValidateJoinRoomRequest {
  role: Role;
  bookingId: Types.ObjectId;
  roomId: string;
  userOrProviderId: Types.ObjectId;
}


//// **** 11. fetch subscription details use case request payload interface 
export interface FetchSubscriptionDetailsRequest {
  subscriptionId: Subscription["_id"];
}
// admin fetch subscription details use case response interface 
export interface FetchSubscriptionDetailsResponse extends CommonResponse {
  subscriptionDetails: findSubscriptionFullDetailsResProps | {};
}


//// **** 12 create credential 
export type CreateCredential = Pick<Credential, "userId" | "accessToken" | "refreshToken" | "expiryDate">


//// **** 13 Google Event
export interface GoogleCalendarEvent extends Partial<Booking> {
  id: string;
  iCalUID?: string;
  kind?: string;
  eventType?: string;

  summary?: string;
  description?: string;

  start: {
    dateTime: string,
    timeZone: string,
  }
  end: {
    dateTime: string,
    timeZone: string,
  };

  created?: string;
  updated?: string;

  htmlLink?: string;
  status?: string;

  creator?: {
    email: string;
    self?: boolean;
  };

  organizer?: {
    email: string;
    self?: boolean;
  };

  reminders?: {
    useDefault: boolean;
    overrides?: {
      method: string;
      minutes: number;
    }[];
  };

  sequence?: number;
  etag?: string;

  extendedProperties?: {
    private: {
      bookingStatus?: string;
      bookingId?: string;
      title?: string;
      backgroundColor?: string;
      textColor?: string;
    },
  },
}

export type UserBookingAddingToCalendar = Pick<GoogleCalendarEvent, "summary" | "description" | "start" | "end" | "extendedProperties"> 

export type UserBookingFetchingFromCalendar = Pick<GoogleCalendarEvent, "id" | "summary" | "description" | "start" | "end" | "creator" | "organizer" | "iCalUID" | "reminders" | "eventType" | "extendedProperties"> 

export interface UpdateGoogleCalendarEventRequest {
  userId: Types.ObjectId,
  eventId: string, 
  appointmentDate: Booking["appointmentDate"], 
  appointmentStatus: Booking["appointmentStatus"],
}

export interface CreateGoogleCalendarEventRequest {
  userId: Types.ObjectId,
  appointmentDate: Booking["appointmentDate"], 
  appointmentStatus: Booking["appointmentStatus"],
  slotDuration: string,
}
import { PlanName } from "../../domain/enums/plan.enum";
import { GeoLocation } from "../../domain/contracts/address.contract";
import { ServiceCategory, ServiceMode, ServiceType } from "../../domain/enums/service.enum";
import { AppointmentStatus } from "../../domain/enums/appointmentStatus.enum";
import { SubscriptionStatus } from "../../domain/enums/subscription.enum";
import { AdminVerificationStatus } from "../../domain/enums/adminVerificationStatus.enum";
import { Day, Role } from "../../domain/enums/common.enum";
import { PaymentFor, PaymentGateway, PaymentStatus } from "../../domain/enums/payment.enum";


// **** ENTITY INTERFACES FOR APPLICATION LAYER **** \\

// **** ADDRESS INTERFACE
export interface AddressDTO {
  _id: string,
  userId: string,
  addressLine: string,
  landMark: string,
  phone: string,
  place: string,
  city: string,
  district: string,
  pincode: string,
  state: string,
  country: string,
  location: GeoLocation,
  createdAt: Date,
  updatedAt: Date,
}

// **** PROVIDER INTERFACE
export interface ProviderDTO {
  _id: string;
  username: string;
  email: string;
  password: string;
  isBlocked: boolean;
  isEmailVerified: boolean;
  isAdminVerified: boolean;
  verificationRejectionReason: string | null;
  adminVerificationStatus: AdminVerificationStatus;
  isAddressVerified: boolean;
  isServiceDetailsVerified: boolean;
  isAvailabilityVerified: boolean;
  isProofsVerified: boolean;
  phone: string | null;
  profileImage: string | null;
  addressId: string | null;
  serviceId: string | null;
  serviceAvailabilityId: string | null;
  subscription: string[];
  verificationToken: string | null;
  googleConnected: boolean;
  googleId: string | null;
  stripeAccountId: string | null;
  trustedBySlotflow: boolean;
  identityProof: string | null;
  serviceProof: string | null;
  allowPushNotification: boolean | null;
  createdAt: Date;
  updatedAt: Date;
}

// **** USER INTERFACE
export interface UserDTO {
  _id: string;
  username: string;
  email: string;
  password: string | null;
  isBlocked: boolean;
  isEmailVerified: boolean;
  phone: string | null;
  profileImage: string | null;
  addressId: string | null;
  bookingsId: string | null;
  verificationToken: string | null;
  googleConnected: boolean;
  googleId: string | null;
  allowPushNotification: boolean | null;
  createdAt: Date,
  updatedAt: Date
}

// **** BOOKING INTERFACE
export interface BookingDTO {
  _id: string,
  serviceProviderId: string,
  userId: string,
  appointmentDate: Date,
  appointmentTime: string,
  appointmentMode: string,
  appointmentStatus: AppointmentStatus,
  slotId: string,
  paymentId: string | null,
  videoCallRoomId: string | null,
  googleEventId: string | null,
  onlineTrack: {
    user: ParticipantPresence;
    provider: ParticipantPresence;
  },
  statusTrack: statusTrack[],
  createdAt: Date,
  updatedAt: Date,
}

export interface ParticipantPresence {
  joined: boolean;
  joinedTime: Date | null;
  leftCallTime: Date | null;
}

export interface statusTrack {
  appointmentStatus: AppointmentStatus;
  time: Date;
}


// **** PAYMENT INTERFACE
export interface PaymentDTO {
  _id: string,
  transactionId: string,
  paymentStatus: PaymentStatus,
  paymentMethod: string,
  paymentGateway: PaymentGateway,
  paymentFor: PaymentFor,
  initialAmount: number,
  discountAmount: number,
  totalAmount: number,
  userId?: string | null,
  providerId?: string | null,
  refundId?: string | null,
  refundAmount?: number | null,
  refundStatus?: string | null,
  refundAt?: Date | null,
  refundReason?: string | null,
  chargeId?: string | null,
  createdAt: Date,
  updatedAt: Date,
}

// **** CREDENTIAL INTERFACE
export interface CredentialDTO {
  _id: string,
  userId: string,
  accessToken: string,
  refreshToken: string,
  expiryDate: Date,
  createdAt: Date,
  updatedAt: Date,
}

// **** PLAN INTERFACE
export interface PlanDTO {
  _id: string,
  planName: PlanName,
  description: string,
  price: number,
  features: string[],
  maxBookingPerMonth: number,
  adVisibility: boolean,
  isBlocked: boolean,
  createdAt: Date,
  updatedAt: Date,
}

// **** PROVIDERSERVICE INTERFACE
export interface ProviderServiceDTO {
  _id: string,
  providerId: string,
  service: string,
  serviceName: string,
  serviceDescription: string,
  servicePrice: number,
  serviceExperience: string,
  serviceType: ServiceType,
  serviceMode: ServiceMode,
  tags: string[] | [],
  requirements: string | null,
  videoUrl: string | null,
  maxParticipants: number,
  isGroupService: boolean,
  createdAt: Date,
  updatedAt: Date,
}

// **** SERVICE INTERFACE
export interface ServiceDTO {
  _id: string,
  serviceName: string,
  serviceCategory: ServiceCategory,
  isBlocked: boolean,
  createdAt: Date,
  updatedAt: Date,
};

// **** SUBSCRIPTION INTERFACE
export interface SubscriptionDTO {
  _id: string,
  providerId: string,
  subscriptionPlanId: string,
  startDate: Date,
  endDate: Date,
  subscriptionStatus: SubscriptionStatus,
  paymentId: string | null,
  createdAt: Date,
  updatedAt: Date,
}

// **** REVIEW INTERFACE
export interface ReviewDTO {
  _id: string,
  userId: string,
  providerId: string,
  bookingId: string,
  reviewText: string,
  rating: number,
  reported: boolean,
  isBlocked: boolean,
  createdAt: Date,
  updatedAt: Date,
}

// **** SERVICEAVAILABILITY INTERFACE AND ITS SUPPORTS
export interface TimeSlot {
  time: string,
};

export interface TimeSlotForFrontendResponse {
  _id: string,
  time: string,
  available: boolean,
  occupied?: boolean,
};

export interface Availability {
  day: Day,
  duration: number,
  startTime: string,
  endTime: string,
  modes: ServiceMode[],
  slots: TimeSlot[],
};

export interface ServiceAvailabilityDTO {
  _id: string,
  providerId: string,
  availabilities: Availability[],
  createdAt: Date,
  updatedAt: Date,
};




// **** Used as the request interface for the paginated request
export interface ApiPaginationRequest {
  page: number;
  limit: number;
}


// **** Used as the response interface for the all request
export interface CommonResponse {
  success?: boolean;
  message?: string;
};


// **** Used as the response interface for the paginated response
export interface ApiResponse<T = unknown> extends CommonResponse {
  totalPages?: number;
  currentPage?: number;
  totalCount?: number;
  data?: T;
}

// **** Used as the type of table data
export interface TableData<T> {
  totalPages?: number;
  currentPage?: number;
  totalCount?: number;
  data?: T
};


// **** Common DTOS used in usecases **** \\

// Used as the payments fetching request and response dto
export interface userIdAndProviderIdFilterForFetchPayments {
  userId?: UserDTO["_id"];
  providerId?: ProviderDTO["_id"];
}
export interface FetchPaymentsRequest extends ApiPaginationRequest, userIdAndProviderIdFilterForFetchPayments { };
export type FetchPaymentResponse = Array<Pick<PaymentDTO, "_id" | "createdAt" | "totalAmount" | "paymentFor" | "paymentGateway" | "paymentStatus" | "paymentMethod" | "discountAmount">> | null;


// Used as the request interface for fetching subscriptions with planName and plan price of a specific provider for the provider side and admin side
export interface GetSubscriptionsRequest extends ApiPaginationRequest {
  providerId?: ProviderDTO["_id"];
}
// Used as the response type for fetching subscriptions with planName and plan price of a specific provider for the provider side and admin side
// removing payment dependedcy data from here the data will be requested from payment service from client directly


// Used as the request type for adding address for user or provider
export type CreateAddressRequest = Pick<AddressDTO, "userId" | "addressLine" | "landMark" | "place" | "phone" | "city" | "country" | "district" | "pincode" | "state" | "location">;


// Used as the request interface for fetching bookings for admin, provider and user side
export interface userIdAndServiceProviderId {
  userId?: UserDTO["_id"];
  serviceProviderId?: ProviderDTO["_id"];
}
export interface GetBookingsRequest extends ApiPaginationRequest, userIdAndServiceProviderId {
  online: boolean;
  role: Role;
}
// Used as the response type for fetching bookings for admin, provider and user side
export type GetBookingsResponse = Array<Pick<BookingDTO, "_id" | "appointmentDate" | "appointmentMode" | "appointmentStatus" | "appointmentTime" | "createdAt" | "videoCallRoomId" | "serviceProviderId">>;
export type GetOnlineBookingsForProviderResponse = Array<
  Pick<
    BookingDTO,
    | "_id"
    | "appointmentDate"
    | "appointmentStatus"
    | "appointmentTime"
    | "videoCallRoomId"
    | "createdAt"
  > & {
    userId: Pick<UserDTO, "username">;
  }
>;
export type GetOnlineBookingsForUserResponse = Array<
  Pick<
    BookingDTO,
    | "_id"
    | "appointmentDate"
    | "appointmentStatus"
    | "appointmentTime"
    | "videoCallRoomId"
    | "createdAt"
  > & {
    serviceProviderId: Pick<ProviderDTO, "username">;
  }
>;


// Used as the response type for fetching AppServices for provider and user side
export interface FetchAllAppServiceRequest {
  categories: Array<ServiceDTO["serviceCategory"]>;
};
export type FetchAllAppServicesResponse = Array<Pick<ServiceDTO, "_id" | "serviceName">> | null;


// Used as the request type for updating address for provider and user side
export type UpdateAddressRequest = Pick<AddressDTO, "_id" | "userId" | "addressLine" | "landMark" | "place" | "phone" | "city" | "country" | "district" | "pincode" | "state" | "location">;


// Used as the interface for the validate join room
export interface ValidateJoinRoomRequest {
  role: Role;
  bookingId: string;
  roomId: string;
  userOrProviderId: string;
};


// fetch subscription details use case request payload interface 
export interface GetSubscriptionDetailsRequest {
  subscriptionId: SubscriptionDTO["_id"];
};
// admin fetch subscription details use case response interface 
type SubscriptionProps = Pick<SubscriptionDTO, "startDate" | "endDate" | "subscriptionStatus" | "createdAt">;
type PlanProps = Pick<PlanDTO, "planName" | "price" | "adVisibility" | "maxBookingPerMonth">;
export interface GetSubscriptionDetailsResponse extends SubscriptionProps {
  subscriptionPlanId: PlanProps,
}

// create credential 
export type CreateCredentialRequest = Pick<CredentialDTO, "userId" | "accessToken" | "refreshToken" | "expiryDate">;
// update credential 
export type UpdateCredentialRequest = Pick<CredentialDTO, "_id" | "accessToken" | "refreshToken" | "expiryDate">;
// fetch credentials credential 
export type FetchCredentialsResponse = Pick<CredentialDTO, "accessToken" | "refreshToken" | "expiryDate" | "userId">;


// Google Event
interface GoogleCalendarEventsPropsForBackend {
  start: {
    dateTime: string,
    timeZone: string,
  };
  end: {
    dateTime: string,
    timeZone: string,
  };
}

interface GoogleCalendarEventsPropsForFrontend {
  start: string;
  end: string;
}

interface CombinedStartAndEndProps {
  start: {
    dateTime: string,
    date: string,
    timeZone: string,
  } | string;
  end: {
    dateTime: string,
    date: string,
    timeZone: string,
  } | string;
}

export interface GoogleCalendarEvent extends Partial<BookingDTO> {
  id: string;
  iCalUID?: string;
  kind?: string;
  eventType?: string;

  summary?: string;
  description?: string;

  start: {
    dateTime?: string,
    date?: string,
    timeZone?: string,
  } | string;
  end: {
    dateTime?: string,
    date?: string,
    timeZone?: string,
  } | string;

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
};

export type AddEventToCalendarProps = Pick<GoogleCalendarEvent, "summary" | "description" | "extendedProperties"> & GoogleCalendarEventsPropsForBackend;

export type FetchEventsFromCalendarProps = Pick<GoogleCalendarEvent, "id" | "summary" | "description" | "creator" | "organizer" | "iCalUID" | "reminders" | "eventType" | "extendedProperties"> & CombinedStartAndEndProps;

export interface UpdateGoogleCalendarEventRequest {
  eventId: string,
  appointmentDate: BookingDTO["appointmentDate"],
  appointmentStatus: BookingDTO["appointmentStatus"],
  accessToken: string,
}

export interface CreateGoogleCalendarEventRequest {
  appointmentDate: BookingDTO["appointmentDate"],
  appointmentStatus: BookingDTO["appointmentStatus"],
  slotDuration: number,
  accessToken: CredentialDTO["accessToken"];
}

export interface UpdateBookingOnlineTrackRequest extends ParticipantPresence {
  role: Role,
  roomId: string,
}

export type UpdateBookingOnlineTrackResponse = Pick<Availability, "duration">;


//// **** Used as the request interface fetching reviews for admin, provider and user side
export interface userIdAndProviderIdFilterForFetchReviews {
  userId?: UserDTO["_id"];
  providerId?: ProviderDTO["_id"];
  role?: Role;
}
export interface GetReviesRequest extends ApiPaginationRequest, userIdAndProviderIdFilterForFetchReviews { }
//// **** Used as the response type fetching payments for admin, provider and user side
export interface GetReviewsResponse extends Pick<ReviewDTO, "_id" | "createdAt" | "reviewText" | "rating" | "reported" | "isBlocked"> {
  userId: Pick<UserDTO, "username" | "profileImage">;
  providerId: Pick<ProviderDTO, "username" | "profileImage">;
};


//// **** Used as the response interface of fetch booking details
export interface GetBookingDetailsRequest {
  bookingId: BookingDTO["_id"];
};
export interface GetBookingDetailsResponse extends Pick<BookingDTO, "appointmentDate" | "appointmentMode" | "appointmentStatus" | "appointmentTime" | "createdAt" | "onlineTrack" | "statusTrack" | "videoCallRoomId"> {
  userId: Pick<UserDTO, "username" | "email">;
  serviceProviderId: Pick<ProviderDTO, "username" | "email">;
};

//// **** Used in s3 controller
export type CreareFileUploadPresignedUrlRequest = {
  folderName: string;
  fileName: string;
  fileType: string;
};

export type CreareFileUploadPresignedUrlResponse = {
  uploadUrl: string;
  key: string;
};

export interface CreateFileSignedUrlRequest {
  key: string;
};


// **** Used in fetch provider proofs usecase
export interface FetchProviderProofsRequest {
  providerId: ProviderDTO["_id"];
};

export type FetchProviderProofsResponse = Pick<ProviderDTO, "identityProof" | "serviceProof">;

export type findAllPlansForDisplayResProps = Pick<PlanDTO, "_id" | "planName" | "price" | "features" | "description">

type FindProviderServiceProps = Omit<ProviderServiceDTO, "service" | "updatedAt" | "createdAt">;
export interface FindProviderServiceResponse extends FindProviderServiceProps {
  service: { serviceName: string }
}

export interface PlanNameOnly {
  subscriptionPlanId: {
    planName: PlanDTO["planName"];
  }
}


export interface FontendAvailabilityForResponse extends Omit<Availability, "slots"> {
  slots: TimeSlotForFrontendResponse[]
}

export interface FrontendAvailabilityForRequest extends Omit<Availability, "slots"> {
  slots: string[];
}

export interface FrontendAvailabilityUpdatedSlots extends Omit<Availability, "slots"> {
  slots: TimeSlot[];
}

export interface DecodedUser {
  userOrProviderId: string;
  role: Role;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  googleId?: string;
  email?: string;
  name?: string;
  image: string | null;
  connectOnly?: boolean;
  exp?: number;
  iat?: number;
  userId?: string;
};

// send provider create payment failed event
export interface ProviderCreatePaymentFailedEventResult {
  mbsData: {
    subscriptionId: string;
  }
};

// send provider create payment success event
export interface ProviderCreatePaymentSuccessEventResult {
  mbsData: {
    subscriptionId: string;
    paymentId: string;
    planDuration: number;
    providerId: string;
  };
};

// get all subscriptions
export type GetSubscriptionsResponse = Array<Pick<SubscriptionDTO, "_id" | "startDate" | "endDate" | "subscriptionStatus"> & Pick<PlanDTO, "planName">>;

export interface UpdateBookingAfterPaymentSuccessEventResult {
  mbsData: {
    bookingId: string;
    paymentId: string;
  }
}

export interface UpdateBookingAfterPaymentFailedEventResult {
  mbsData: {
    bookingId: string;
  }
}

export interface LinkStripeCustomerRequest {
  userId: string;
  role: Role;
  stripeCustomerId: string;
}
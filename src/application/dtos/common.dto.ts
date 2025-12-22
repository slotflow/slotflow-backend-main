import { Types } from "mongoose";
import { Day } from "../../domain/enums/day.enum";
import { PaymentFor } from "../../domain/enums/paymentFor.enum";
import { ServiceType } from "../../domain/enums/serviceType.enum";
import { ServiceMode } from "../../domain/enums/serviceMode.enum";
import { GeoLocation } from "../../domain/contracts/address.contract";
import { PaymentGateway } from "../../domain/enums/paymentGateway.enum";
import { ServiceCategory } from "../../domain/enums/serviceCategories.enum";
import { AppointmentStatus } from "../../domain/enums/appointmentStatus.enum";
import { SubscriptionStatus } from "../../domain/enums/subscriptionStatus.enum";
import { AdminVerificationStatus } from "../../domain/enums/adminVerificationStatus.enum";
import { adminVerificationStatusArray, appointmentStatusArray, daysArray, paymentForArray, paymentGatewayArray, roleArray, serviceCategoryArray, serviceModeArray, serviceTypeArray, subscriptionStatusArray } from "../../shared/utils/constants";

export type RoleType = typeof roleArray[number];

export type DayType = typeof daysArray[number];

export type ServiceModeType = typeof serviceModeArray[number];

export type ServiceTypeType = typeof serviceTypeArray[number];

export type AppointmentStatusType = typeof appointmentStatusArray[number];

export type PaymentForType = typeof paymentForArray[number];

export type PaymentGatewayType = typeof paymentGatewayArray[number];

export type SubscriptionStatusType = typeof subscriptionStatusArray[number];

export type ServiceCategoryType = typeof serviceCategoryArray[number];

export type AdminVerificationStatusType = typeof adminVerificationStatusArray[number];

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
  appointmentStatus: string,
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
  paymentStatus: string,
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
  planName: string,
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
  paymentId: string,
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

// **** Used as the type of table data
export interface TableData<T> {
  totalPages?: number;
  currentPage?: number;
  totalCount?: number;
  data?: T
}


//// **** 4.1 Used as the request interface for fetching subscriptions with planName and plan price of a specific provider for the provider side and admin side
export interface FetchProviderSubscriptionsRequest extends ApiPaginationRequest {
  providerId: ProviderDTO["_id"];
}
//// **** 4.2 Used as the response type for fetching subscriptions with planName and plan price of a specific provider for the provider side and admin side
export type FindSubscriptionsByProviderIdResponse = Array<
  Pick<SubscriptionDTO, "_id" | "startDate" | "endDate" | "subscriptionStatus"> &
  Partial<Pick<PlanDTO, "planName">>> &
  Partial<Pick<PaymentDTO, "totalAmount">>;
export type PopulatedSubscription = Omit<SubscriptionDTO, 'subscriptionPlanId' | "paymentId"> & {
  subscriptionPlanId: {
    planName: string;
  },
  paymentId: {
    totalAmount: string;
  }
};



//// **** 5. Used as the request type for adding address for user or provider
export type CreateAddressRequest = Pick<AddressDTO, "userId" | "addressLine" | "landMark" | "place" | "phone" | "city" | "country" | "district" | "pincode" | "state" | "location">;


//// **** 6.1 Used as the request interface fetching payments for admin, provider and user side
export interface userIdAndProviderIdFilterForFetchPayments {
  userId?: UserDTO["_id"];
  providerId?: ProviderDTO["_id"];
  paymentFor?: PaymentForType | { $in: PaymentForType[] };
}
export interface FetchPaymentsRequest extends ApiPaginationRequest, userIdAndProviderIdFilterForFetchPayments { }
//// **** 6.1 Used as the response type fetching payments for admin, provider and user side
export type FetchPaymentResponse = Array<Pick<PaymentDTO, "_id" | "createdAt" | "totalAmount" | "paymentFor" | "paymentGateway" | "paymentStatus" | "paymentMethod" | "discountAmount">>;



//// **** 7.1 Used as the request interface for fetching bookings for admin, provider and user side
export interface userIdAndServiceProviderId {
  userId?: UserDTO["_id"];
  serviceProviderId?: ProviderDTO["_id"];
}
export interface FetchBookingsRequest extends ApiPaginationRequest, userIdAndServiceProviderId {
  online: boolean;
  raw: boolean;
  role: RoleType;
}
//// **** 7.2 Used as the response type for fetching bookings for admin, provider and user side
export type FetchBookingsResponse = Array<Pick<BookingDTO, "_id" | "appointmentDate" | "appointmentMode" | "appointmentStatus" | "appointmentTime" | "createdAt" | "videoCallRoomId" | "serviceProviderId">>;
export type FetchOnlineBookingsForProviderResponse = Array<
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
export type FetchOnlineBookingsForUserResponse = Array<
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

//// **** 8. Used as the response type for fetching AppServices for provider and user side
export type FetchAllAppServiceRequest = Pick<ServiceDTO, "serviceCategory">;
export type FetchAllAppServicesResponse = Array<Pick<ServiceDTO, "_id" | "serviceName">>;

//// **** 9. Used as the request type for updating address for provider and user side
export type UpdateAddressRequest = Pick<AddressDTO, "_id" | "userId" | "addressLine" | "landMark" | "place" | "phone" | "city" | "country" | "district" | "pincode" | "state" | "location">;

//// **** 10. Used as the interface for the validate join room
export interface ValidateJoinRoomRequest {
  role: RoleType;
  bookingId: Types.ObjectId;
  roomId: string;
  userOrProviderId: Types.ObjectId;
}


//// **** 11. fetch subscription details use case request payload interface 
export interface FetchSubscriptionDetailsRequest {
  subscriptionId: SubscriptionDTO["_id"];
}
// admin fetch subscription details use case response interface 
export interface FetchSubscriptionDetailsResponse extends CommonResponse {
  subscriptionDetails: findSubscriptionFullDetailsResProps | {};
}


//// **** 12 create credential 
export type CreateCredentialRequest = Pick<CredentialDTO, "userId" | "accessToken" | "refreshToken" | "expiryDate">;
export type UpdateCredentialRequest = Pick<CredentialDTO, "_id" | "accessToken" | "refreshToken" | "expiryDate">;


//// **** 13 Google Event
export interface GoogleCalendarEvent extends Partial<BookingDTO> {
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
  appointmentDate: BookingDTO["appointmentDate"],
  appointmentStatus: BookingDTO["appointmentStatus"],
}

export interface CreateGoogleCalendarEventRequest {
  userId: Types.ObjectId,
  appointmentDate: BookingDTO["appointmentDate"],
  appointmentStatus: BookingDTO["appointmentStatus"],
  slotDuration: number,
}

export interface UpdateBookingOnlineTrackRequest extends ParticipantPresence {
  role: RoleType,
  roomId: string,
}

export type UpdateBookingOnlineTrackResponse = Pick<Availability, "duration">;



//// **** Used as the request interface fetching reviews for admin, provider and user side
export interface userIdAndProviderIdFilterForFetchReviews {
  userId?: UserDTO["_id"];
  providerId?: ProviderDTO["_id"];
  role?: RoleType;
}
export interface FetchReviesRequest extends ApiPaginationRequest, userIdAndProviderIdFilterForFetchReviews { }
//// **** Used as the response type fetching payments for admin, provider and user side
export interface FetchReviewsResponse extends Pick<ReviewDTO, "_id" | "createdAt" | "reviewText" | "rating" | "reported" | "isBlocked"> {
  userId: Pick<UserDTO, "username" | "profileImage">;
  providerId: Pick<ProviderDTO, "username" | "profileImage">;
};


//// **** Used as the response interface of fetch booking details
export interface FetchBookingDetailsRequest {
  bookingId: BookingDTO["_id"];
};
export interface FetchBookingDetailsResponse extends Pick<BookingDTO, "appointmentDate" | "appointmentMode" | "appointmentStatus" | "appointmentTime" | "createdAt" | "onlineTrack" | "statusTrack" | "videoCallRoomId"> {
  userId: Pick<UserDTO, "username" | "email">;
  serviceProviderId: Pick<ProviderDTO, "username" | "email">;
};


export type SubscriptionPlan = "Free" | "NoSubscription" | "Starter" | "Professional" | "Enterprise";


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

type FindProviderServiceProps = Omit<ProviderServiceDTO, "service">;
export interface FindProviderServiceResponse extends FindProviderServiceProps {
  service: Pick<ServiceDTO, "serviceName">
}


export interface FindProvidersUsingServiceIdsResponse {
  _id: string,
  provider: {
    _id: string,
    username: string,
    profileImage: string | null,
    trustedBySlotflow: boolean,
  },
  serviceDetails: {
    serviceId: string;
    service: string;
    serviceCategory: string;
    serviceName: string;
    servicePrice: string;
  }
}


type SubscriptionProps = Pick<SubscriptionDTO, "startDate" | "endDate" | "subscriptionStatus" | "createdAt">;
type PaymentsProps = Pick<PaymentDTO, "transactionId" | "discountAmount" | "initialAmount" | "paymentFor" | "paymentGateway" | "paymentMethod" | "paymentStatus" | "totalAmount">;
type PlanProps = Pick<PlanDTO, "planName" | "price" | "adVisibility" | "maxBookingPerMonth">;
export interface findSubscriptionFullDetailsResProps extends SubscriptionProps {
  subscriptionPlanId: PlanProps,
  paymentId: PaymentsProps,
}

export interface PlanNameOnly {
  subscriptionPlanId: {
    planName: string
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
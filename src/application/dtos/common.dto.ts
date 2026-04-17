import { PlanName } from "../../domain/enums/plan.enum";
import { Day, Role } from "../../domain/enums/common.enum";
import { GeoLocation } from "../../domain/contracts/address.contract";
import { SubscriptionStatus } from "../../domain/enums/subscription.enum";
import { AppointmentStatus } from "../../domain/enums/appointmentStatus.enum";
import { AdminVerificationStatus } from "../../domain/enums/adminVerificationStatus.enum";
import { ServiceCategory, ServiceMode, ServiceType } from "../../domain/enums/service.enum";

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

// **** USER INTERFACE
export interface UserDTO {
  _id: string;
  username: string;
  email: string;
  password: string | null;
  role: Role;
  hasSelectedRole: boolean;
  isOnboardingCompleted: boolean;
  isBlocked: boolean;
  phone: string | null;
  profileImage: string | null;
  addressId: string | null;
  googleConnected: boolean;
  googleId: string | null;
  stripeConnected: boolean;
  stripeAccountId: string | null;
  stripeCustomerId: string | null;
  allowPushNotification: boolean | null;
  createdAt: Date;
  updatedAt: Date
}

// **** PROVIDER PROFILE INTERFACE
export interface ProviderProfileDTO {
  _id: string;
  userId: string;
  isAdminVerified: boolean;
  verificationRejectionReason: string | null;
  adminVerificationStatus: AdminVerificationStatus;
  isAddressVerified: boolean;
  isServiceDetailsVerified: boolean;
  isAvailabilityVerified: boolean;
  isProofsVerified: boolean;
  serviceId: string | null;
  serviceAvailabilityId: string | null;
  subscription: string[];
  trustedBySlotflow: boolean;
  identityProof: string | null;
  serviceProof: string | null;
  createdAt: Date;
  updatedAt: Date;
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
export interface ApiPaginationInput {
  page: number;
  limit: number;
}


// **** Used as the response interface for the all request
export interface CommonOutput {
  success?: boolean;
  message?: string;
};


// **** Used as the response interface for the paginated response
export interface ApiOutput<T = unknown> extends CommonOutput {
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

// used in add event to calendar usecase
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

// used in add event to calendar usecase
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

// used in add event to calendar usecase
export type AddEventToCalendarProps = Pick<GoogleCalendarEvent, "summary" | "description" | "extendedProperties"> & GoogleCalendarEventsPropsForBackend;

// used in get events from calendar usecase
export type GetEventsFromCalendarProps = Pick<GoogleCalendarEvent, "id" | "summary" | "description" | "creator" | "organizer" | "iCalUID" | "reminders" | "eventType" | "extendedProperties"> & CombinedStartAndEndProps;

// used in update google calendar event usecase
export interface UpdateGoogleCalendarEventInput {
  eventId: string,
  appointmentDate: BookingDTO["appointmentDate"],
  appointmentStatus: BookingDTO["appointmentStatus"],
  accessToken: string,
}

// used in create google calendar event usecase
export interface CreateGoogleCalendarEventInput {
  appointmentDate: BookingDTO["appointmentDate"],
  appointmentStatus: BookingDTO["appointmentStatus"],
  slotDuration: number,
  accessToken: CredentialDTO["accessToken"];
}

// used in create file upload presigned url usecase
export interface CreareFileUploadPresignedUrlInput {
  folderName: string;
  fileName: string;
  fileType: string;
};

// used in create file upload presigned url usecase
export interface CreareFileUploadPresignedUrlOutput {
  uploadUrl: string;
  key: string;
};

// used in create file signed url usecase
export interface CreateFileSignedUrlInput {
  key: string;
};

// used in find provider service usecase
type FindProviderServiceProps = Omit<ProviderServiceDTO, "service" | "updatedAt" | "createdAt">;
export interface FindProviderServiceOutput extends FindProviderServiceProps {
  service: { serviceName: string }
}

// used in create service availability usecase
export interface PlanNameOnly {
  subscriptionPlanId: {
    planName: PlanDTO["planName"];
  }
}

// used in create service availability usecase
export interface FrontendAvailabilityForResponse extends Omit<Availability, "slots"> {
  slots: TimeSlotForFrontendResponse[]
}

// used in create service availability usecase
export interface FrontendAvailabilityForRequest extends Omit<Availability, "slots"> {
  slots: string[];
}

// used in create service availability usecase
export interface FrontendAvailabilityUpdatedSlots extends Omit<Availability, "slots"> {
  slots: TimeSlot[];
}

// used in auth controller
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

// used in update booking after payment success event
export interface UpdateBookingAfterPaymentSuccessEventResult {
  mbsData: {
    bookingId: string;
    paymentId: string;
  }
}

// used in update booking after payment failed event
export interface UpdateBookingAfterPaymentFailedEventResult {
  mbsData: {
    bookingId: string;
  }
}

// used in link stripe customer usecase
export interface LinkStripeCustomerRequest {
  userId: string;
  stripeCustomerId: string;
}

// used in count query
export type CountResult = { count: number };
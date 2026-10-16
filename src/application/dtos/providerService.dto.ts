import { UserProps } from "../../domain/contracts/user.contract";
import { ServiceCategory } from "../../domain/enums/service.enum";
import { AddressProps } from "../../domain/contracts/address.contract";
import { ServiceProps } from "../../domain/contracts/service.contract";
import { ProviderProfileProps } from "../../domain/contracts/providerProfile.contract";
import { ProviderServiceProps } from "../../domain/contracts/providerService.contract";

/**
 * Provider service queries dtos
 */

// findByProviderId method
export interface ProviderServiceByProviderIdQuery {
  providerId: UserProps["_id"];
}
type FindProviderService = Pick<
  ProviderServiceProps,
  | "serviceName"
  | "serviceDescription"
  | "servicePrice"
  | "serviceExperience"
  | "serviceType"
  | "requirements"
  | "maxParticipants"
  | "isGroupService"
  | "videoUrl"
  | "portfolioUrl"
>;
export interface ProviderServiceByProviderIdView extends FindProviderService {
  serviceId: { serviceName: string };
  _id?: string;
  providerId?: string;
  tags: string[] | [];
}

// findProvidersCardDataForUsers method
export interface ProviderServiceByServiceIdsQuery {
  serviceIds?: string[];
  categories?: ServiceCategory[];
  location?: AddressProps["location"];
  maxPrice?: number;
  minPrice?: number;
  slotflowTrusted?: boolean;
  radius?: number;
  skip?: number;
  limit?: number;
}
export interface ProviderServiceByServiceIds {
  _id: ProviderServiceProps["_id"];
  provider: {
    _id: ProviderServiceProps["providerId"];
    username: UserProps["username"];
    profileImage: UserProps["profileImage"];
    trustedBySlotflow: ProviderProfileProps["trustedBySlotflow"];
  };
  serviceDetails: {
    serviceId: ProviderServiceProps["serviceId"];
    service: ServiceProps["serviceName"];
    serviceCategory: ServiceProps["serviceCategory"];
    serviceName: ProviderServiceProps["serviceName"];
    servicePrice: ProviderServiceProps["servicePrice"];
  };
}
export type ProviderServiceByServiceIdsView = Array<ProviderServiceByServiceIds>;

// updateProviderService method
export type UpdateProviderServiceQuery = Pick<
  ProviderServiceProps,
  | "_id"
  | "serviceId"
  | "serviceName"
  | "serviceDescription"
  | "servicePrice"
  | "isGroupService"
  | "maxParticipants"
  | "serviceExperience"
  | "serviceType"
  | "tags"
> &
  Partial<Pick<ProviderServiceProps, "videoUrl" | "requirements">>;
export type UpdateProviderServiceView = ProviderServiceByProviderIdView | null;

/**
 * Provider service usecase dtos
 */

// get providers services
export type GetProvidersServicesInput = ProviderServiceByServiceIdsQuery;
export type GetProvidersServicesOutput = ProviderServiceByServiceIdsView;

// create provider service
export type CreateProviderServiceInput = Pick<
  ProviderServiceProps,
  | "isGroupService"
  | "maxParticipants"
  | "providerId"
  | "requirements"
  | "serviceId"
  | "serviceDescription"
  | "serviceExperience"
  | "serviceExperienceYears"
  | "serviceName"
  | "servicePrice"
  | "serviceType"
  | "tags"
  | "videoUrl"
  | "portfolioUrl"
>;

// get provider service
export interface GetProviderServiceInput {
  providerId: UserProps["_id"];
}
export type GetProviderServiceOuput = ProviderServiceByProviderIdView | null;

// update provider service
export type UpdateProviderServiceInput = Pick<
  ProviderServiceProps,
  | "serviceId"
  | "serviceName"
  | "serviceDescription"
  | "servicePrice"
  | "isGroupService"
  | "maxParticipants"
  | "serviceExperience"
  | "serviceType"
  | "tags"
  | "portfolioUrl"
  | "serviceExperienceYears"
> &
  Partial<Pick<ProviderServiceProps, "videoUrl" | "requirements">> & {
    providerServiceId: ProviderServiceProps["_id"];
  };
export type UpdateProviderServiceOutput = ProviderServiceByProviderIdView | null;

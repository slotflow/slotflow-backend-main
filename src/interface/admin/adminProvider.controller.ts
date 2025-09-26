import { Types } from "mongoose";
import { Request, Response } from "express";
import { HandleError } from "../../infrastructure/error/error";
import { AddressRepositoryImpl } from "../../infrastructure/database/address/address.repository.impl";
import { PaymentRepositoryImpl } from "../../infrastructure/database/payment/payment.repository.impl";
import { ProviderRepositoryImpl } from "../../infrastructure/database/provider/provider.repository.impl";
import { AdminFetchUserOrProviderAddressUseCase } from "../../application/admin-use.case/adminAddress.use-case";
import { DateZodSchema, RequestQueryCommonZodSchema, ValidateObjectId } from "../../infrastructure/zod/common.zod";
import { SubscriptionRepositoryImpl } from "../../infrastructure/database/subscription/subscription.repository.impl";
import { ProviderServiceRepositoryImpl } from "../../infrastructure/database/providerService/providerService.repository.impl";
import { AdminChangeProviderStatusZodSchema, AdminChangeProviderTrustedTagZodSchema } from "../../infrastructure/zod/admin.zod";
import { ServiceAvailabilityRepositoryImpl } from "../../infrastructure/database/serviceAvailability/serviceAvailability.repository.impl";
import { AdminApproveProviderUseCase, AdminChangeProviderBlockStatusUseCase, AdminChangeProviderTrustTagUseCase, AdminProviderListUseCase } from "../../application/admin-use.case/adminProvider/adminProvider.use-case";
import { AdminFetchProviderDetailsUseCase, AdminFetchProviderPaymentsUseCase, AdminfetchProviderServiceAvailabilityUseCase, AdminFetchProviderServiceUseCase, AdminFetchProviderSubscriptionsUseCase } from "../../application/admin-use.case/adminProvider/adminProviderProfile.use-case";

const addressRepositoryImpl = new AddressRepositoryImpl();
const paymentRepositoryImpl = new PaymentRepositoryImpl();
const providerRepositoryImpl = new ProviderRepositoryImpl();
const subscriptionRepositoryImpl = new SubscriptionRepositoryImpl();
const serviceAvailabilityImpl = new ServiceAvailabilityRepositoryImpl();
const providerServiceRepositoryImpl = new ProviderServiceRepositoryImpl();

const adminProviderListUseCase = new AdminProviderListUseCase(providerRepositoryImpl);
const adminApproveProviderUseCase = new AdminApproveProviderUseCase(providerRepositoryImpl);
const adminFetchProviderDetailsUseCase = new AdminFetchProviderDetailsUseCase(providerRepositoryImpl);
const adminChangeProviderTrustTagUseCase = new AdminChangeProviderTrustTagUseCase(providerRepositoryImpl);
const adminChangeProviderBlockStatusUseCase = new AdminChangeProviderBlockStatusUseCase(providerRepositoryImpl);
const adminFetchUserOrProviderAddressUseCase = new AdminFetchUserOrProviderAddressUseCase(addressRepositoryImpl);
const adminFetchProviderPaymentsUseCase = new AdminFetchProviderPaymentsUseCase(providerRepositoryImpl,paymentRepositoryImpl)
const adminFetchProviderServiceUseCase = new AdminFetchProviderServiceUseCase(providerRepositoryImpl, providerServiceRepositoryImpl);
const adminFetchProviderSubscriptionsUseCase = new AdminFetchProviderSubscriptionsUseCase(providerRepositoryImpl,subscriptionRepositoryImpl);
const adminFetchProviderServiceAvailabilityUseCase = new AdminfetchProviderServiceAvailabilityUseCase(providerRepositoryImpl, serviceAvailabilityImpl);

class AdminProviderController {
    constructor(
        private adminProviderListUseCase : AdminProviderListUseCase,
        private adminApproveProviderUseCase : AdminApproveProviderUseCase,
        private adminChangeProviderBlockStatusUseCase : AdminChangeProviderBlockStatusUseCase,
        private adminChangeProviderTrustTagUseCase : AdminChangeProviderTrustTagUseCase,
        private adminFetchProviderDetailsUseCase : AdminFetchProviderDetailsUseCase,
        private adminFetchUserOrProviderAddressUseCase : AdminFetchUserOrProviderAddressUseCase,
        private adminFetchProviderServiceUseCase : AdminFetchProviderServiceUseCase,
        private adminFetchProviderServiceAvailabilityUseCase : AdminfetchProviderServiceAvailabilityUseCase,
        private adminFetchProviderSubscriptionsUseCase : AdminFetchProviderSubscriptionsUseCase,
        private adminFetchProviderPaymentsUseCase : AdminFetchProviderPaymentsUseCase,
    ){
        this.getAllProviders = this.getAllProviders.bind(this);
        this.approveProvider = this.approveProvider.bind(this);
        this.changeProviderBlockStatus = this.changeProviderBlockStatus.bind(this);
        this.fetchProviderDetails = this.fetchProviderDetails.bind(this);
        this.fetchProviderAddress = this.fetchProviderAddress.bind(this);
        this.fetchProviderService = this.fetchProviderService.bind(this);
        this.fetchProviderServiceAvailability = this.fetchProviderServiceAvailability.bind(this);
        this.changeProviderTrustedTag = this.changeProviderTrustedTag.bind(this);
        this.fetchProviderSubscriptions = this.fetchProviderSubscriptions.bind(this);
        this.fetchProviderPayments = this.fetchProviderPayments.bind(this);
    }

    async getAllProviders(req: Request, res: Response) {
        try{
            const { page, limit } = RequestQueryCommonZodSchema.parse(req.query);
            const result = await this.adminProviderListUseCase.execute({ page, limit });
            res.status(200).json(result);
        }catch(error){
            HandleError.handle(error, res);
        }
    }

    async approveProvider(req: Request, res: Response) {
        try{
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            if(!providerId) throw new Error("Invalid request.");
            const result = await this.adminApproveProviderUseCase.execute({providerId : new Types.ObjectId(providerId as string)});
            res.status(204).json(result);
        }catch(error){
            HandleError.handle(error, res);
        }
    }

    async changeProviderBlockStatus(req: Request, res: Response) {
        try{
            const { blockStatus } = AdminChangeProviderStatusZodSchema.parse(req.body);
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            if(!providerId || blockStatus === null) throw new Error("Invalid request.");
            const result = await this.adminChangeProviderBlockStatusUseCase.execute({providerId : new Types.ObjectId(providerId), isBlocked: blockStatus });
            res.status(204).json(result);
        }catch(error){
            HandleError.handle(error, res);
        }
    }

    async changeProviderTrustedTag(req: Request, res: Response) {
        try{
            const { trustTag }  = AdminChangeProviderTrustedTagZodSchema.parse(req.body);
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            if(!providerId || trustTag === null || undefined) throw new Error("Invalid request.");
            const result = await this.adminChangeProviderTrustTagUseCase.execute({providerId : new Types.ObjectId(providerId), trustedBySlotflow: trustTag });
            res.status(204).json(result);
        }catch (error) {
            HandleError.handle(error,res);
        }
    }

    async fetchProviderDetails(req:Request, res: Response) {
        try{
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            if(!providerId) throw new Error("Invalid request.");
            const result = await this.adminFetchProviderDetailsUseCase.execute({providerId : new Types.ObjectId(providerId)});
            res.status(200).json(result);
        }catch(error){
            HandleError.handle(error,res);
        }
    }
    
    async fetchProviderAddress(req:Request, res: Response) {
        try{
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            if(!providerId) throw new Error("Invalid request.");
            const result = await this.adminFetchUserOrProviderAddressUseCase.execute(new Types.ObjectId(providerId));
            res.status(200).json(result);
        }catch(error){
            HandleError.handle(error,res);
        }
    }

    async fetchProviderService(req:Request, res:Response) {
        try{
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            if(!providerId) throw new Error("Invalid request.");
            const result = await this.adminFetchProviderServiceUseCase.execute({providerId : new Types.ObjectId(providerId)});
            res.status(200).json(result);
        }catch(error){
            HandleError.handle(error,res);
        }
    }

    async fetchProviderServiceAvailability(req:Request, res: Response) {
        try{
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            const { date } = DateZodSchema.parse(req.query);
            if(!providerId || !date) throw new Error("Invalid request.");
            const result = await this.adminFetchProviderServiceAvailabilityUseCase.execute({providerId : new Types.ObjectId(providerId), date: new Date(date) });
            res.status(200).json(result);
        }catch(error){
            HandleError.handle(error, res);
        }
    }

    async fetchProviderSubscriptions(req: Request, res: Response) {
        try{
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            const { page, limit } = RequestQueryCommonZodSchema.parse(req.query);
            const result = await this.adminFetchProviderSubscriptionsUseCase.execute({providerId : new Types.ObjectId(providerId), page, limit });
            res.status(200).json(result);
        }catch (error) {
            HandleError.handle(error,res);
        }
    }

    async fetchProviderPayments(req: Request, res: Response) {
        try{
            const { id: providerId } = ValidateObjectId(req.params.providerId, "Provider ID");
            const { page, limit } = RequestQueryCommonZodSchema.parse(req.query);
            if(!providerId) throw new Error("Invalid request.");
            const result = await this.adminFetchProviderPaymentsUseCase.execute({providerId : new Types.ObjectId(providerId), page, limit });
            res.status(200).json(result);
        }catch (error) {
            HandleError.handle(error,res);
        }
    }
   
}

const adminProviderController = new AdminProviderController(adminProviderListUseCase, adminApproveProviderUseCase, adminChangeProviderBlockStatusUseCase, adminChangeProviderTrustTagUseCase,adminFetchProviderDetailsUseCase, adminFetchUserOrProviderAddressUseCase, adminFetchProviderServiceUseCase, adminFetchProviderServiceAvailabilityUseCase, adminFetchProviderSubscriptionsUseCase, adminFetchProviderPaymentsUseCase);
export { adminProviderController };


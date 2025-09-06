import { Types } from "mongoose";
import { Request, Response } from "express";
import { HandleError } from "../../infrastructure/error/error";
import { ServiceRepositoryImpl } from "../../infrastructure/database/appservice/service.repository.impl";
import { AdminAddServiceUseCase, AdminChnageServiceBlockStatusUseCase, AdminServiceListUseCase } from "../../application/admin-use.case/adminService.use-case";
import { AdminAddServiceXZodSchema, AdminChangeServiceBlockStatusZodSchema } from "../../infrastructure/zod/admin.zod";
import { RequestQueryCommonZodSchema, ValidateObjectId } from "../../infrastructure/zod/common.zod";

const serviceRepositoryImpl = new ServiceRepositoryImpl();

const adminServiceListUseCase = new AdminServiceListUseCase(serviceRepositoryImpl)
const adminAddServiceUseCase = new AdminAddServiceUseCase(serviceRepositoryImpl)
const adminChnageServiceBlockStatusUseCase = new AdminChnageServiceBlockStatusUseCase(serviceRepositoryImpl)

class AdminServiceController {
    constructor(
        private adminServiceListUseCase: AdminServiceListUseCase,
        private adminAddServiceUseCase: AdminAddServiceUseCase,
        private adminChnageServiceBlockStatusUseCase: AdminChnageServiceBlockStatusUseCase,
    ){
        this.getAllServices = this.getAllServices.bind(this);
        this.addService = this.addService.bind(this);
        this.changeServiceBlockStatus = this.changeServiceBlockStatus.bind(this);
    }

    async getAllServices(req: Request, res: Response) {
        try{
            const validateQuery = RequestQueryCommonZodSchema.parse(req.query);
            const { page, limit } = validateQuery;
            const result = await this.adminServiceListUseCase.execute({ page, limit });
            res.status(200).json(result);
        }catch(error){
            HandleError.handle(error, res);
        }
    }

    async addService(req: Request, res: Response) {
        try{
            const validateBody = AdminAddServiceXZodSchema.parse(req.body);
            const { appServiceName } = validateBody;
            if(!appServiceName) throw new Error("Invalid request.");
            const result = await this.adminAddServiceUseCase.execute({serviceName : appServiceName});
            res.status(200).json(result);
        }catch(error){
            HandleError.handle(error,res);
        }
    }

    async changeServiceBlockStatus(req: Request, res: Response) {
        try{
            const validateBody = AdminChangeServiceBlockStatusZodSchema.parse(req.body);
            const { blockStatus } = validateBody;
            const validateParams = ValidateObjectId(req.params.serviceId, "Service ID");
            const { id: serviceId } = validateParams;
            const result = await this.adminChnageServiceBlockStatusUseCase.execute({serviceId: new Types.ObjectId(serviceId), isBlocked: blockStatus });
            res.status(200).json(result);
        }catch(error){
            HandleError.handle(error,res);
        }
    }
   
}

const adminServiceController = new AdminServiceController(adminServiceListUseCase, adminAddServiceUseCase, adminChnageServiceBlockStatusUseCase);
export { adminServiceController };


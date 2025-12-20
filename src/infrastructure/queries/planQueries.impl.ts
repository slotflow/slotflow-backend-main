import { PlanModel } from "../database/plan/plan.model";
import { IPlanQueries } from "../../application/queries/IPlan.queries";
import { AdminPlanListResponse } from "../../application/dtos/admin.dto";
import { ApiPaginationRequest, findAllPlansForDisplayResProps, TableData } from "../../application/dtos/common.dto";

export class PlanQueriesImpl implements IPlanQueries {

    async findAll({ page, limit }: ApiPaginationRequest): Promise<TableData<AdminPlanListResponse>> {
        const skip = (page - 1) * limit;
        const [plans, totalCount] = await Promise.all([
            PlanModel.find({}, {
                _id: 1,
                planName: 1,
                price: 1,
                maxBookingPerMonth: 1,
                isBlocked: 1,
                adVisibility: 1,
            }).skip(skip).limit(limit).lean<AdminPlanListResponse>(),
            PlanModel.countDocuments(),
        ]);
        const totalPages = Math.ceil(totalCount / limit);
        return {
            data: plans.map(plan => ({
                ...plan,
                _id: plan._id.toString(),
            })),
            totalPages,
            currentPage: page,
            totalCount
        }
    };

    async findAllForDisplay(): Promise<Array<findAllPlansForDisplayResProps>> {
        const plans = await PlanModel.find({}, {
            _id: 1,
            planName: 1,
            price: 1,
            features: 1,
            description: 1
        });
        return plans.map(plan => ({
            ...plan,
            _id: plan._id.toString(),
        }));
    };

};
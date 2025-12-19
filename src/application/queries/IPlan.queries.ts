import { AdminPlanListResponse } from "../dtos/admin.dto";
import { ApiPaginationRequest, findAllPlansForDisplayResProps, TableData } from "../dtos/common.dto";

export interface IPlanQueries {

    findAll({ page, limit }: ApiPaginationRequest): Promise<TableData<AdminPlanListResponse>>;

    findAllForDisplay(): Promise<Array<findAllPlansForDisplayResProps>>;

};
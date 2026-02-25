import { GetReviesRequest, GetReviewsResponse, TableData } from "../dtos/common.dto";

export interface IReviewQueries {

    findAll(payload: GetReviesRequest): Promise<TableData<Array<GetReviewsResponse>>>;

};
import { FetchReviesRequest, FetchReviewsResponse, TableData } from "../dtos/common.dto";

export interface IReviewQueries {

    findAll(payload: FetchReviesRequest) : Promise<TableData<Array<FetchReviewsResponse>>>;

};
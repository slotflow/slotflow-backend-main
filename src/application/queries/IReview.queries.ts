import { TableData } from "../dtos/common.dto";
import { GetReviewsQuery, GetReviewsView } from "../dtos/review.dtos";

export interface IReviewQueries {

    findAll(query: GetReviewsQuery): Promise<TableData<Array<GetReviewsView>>>;

};
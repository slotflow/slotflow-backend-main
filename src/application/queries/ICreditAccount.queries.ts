import { GetCreditAccountDetailsQuery, GetCreditAccountDetailsView } from "../dtos/credits.dto";

export interface ICreditAccountQueries {

    findCreditAccountDetailsWithGraphData(query: GetCreditAccountDetailsQuery): Promise<GetCreditAccountDetailsView>;
    
}
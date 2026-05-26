import { GetCreditAccountDetailsQuery, GetCreditAccountDetailsView } from "../dtos/credits.dto";

export interface ICreditAccountQueries {

    findCreditDetails(query: GetCreditAccountDetailsQuery): Promise<GetCreditAccountDetailsView>;
    
}
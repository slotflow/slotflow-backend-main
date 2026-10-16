import { IUserQueries } from "../../../../interfaces/queries/IUser.queries";
import { toAppError } from "../../../../../shared/error/handleUnknownError";
import { GetUserChartDataInput, GetUserChartDataOutput } from "../../../../dtos/admin.dto";

export class GetRoleBasedChartDataUseCase {
  constructor(private readonly userQueries: IUserQueries) {}

  async execute(input: GetUserChartDataInput): Promise<GetUserChartDataOutput> {
    try {
      return await this.userQueries.findAdminDashboardUserChartData(input);
    } catch (error: unknown) {
      throw toAppError(error, "Failed to fetch user chart data");
    }
  }
}

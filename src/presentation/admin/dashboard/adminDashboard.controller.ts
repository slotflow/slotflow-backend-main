import { log } from "../../../shared/logger/logger";
import { NextFunction, Request, Response } from "express";
import { sendResponse } from "../../../shared/utils/helpers/response";
import { startAndEndDateSchema } from "../../../shared/zod/common.zod";
import { adminGetRoleBasedChartData } from "../../../shared/zod/admin.zod";
import { GetAdminBookingsChartDataUseCase } from "../../../application/useCases/admin/dashboard/chartData/getBookingsChartData.useCase";
import { GetUserStatsDataUseCase } from "../../../application/useCases/admin/dashboard/stats/getUsersStatsData.useCase";
import { GetBookingsStatsDataUseCase } from "../../../application/useCases/admin/dashboard/stats/getBookingsStatsData.useCase";
import { GetProviderStatsDataUseCase } from "../../../application/useCases/admin/dashboard/stats/getProvidersStatsData.useCase";
import { GetRoleBasedChartDataUseCase } from "../../../application/useCases/admin/dashboard/chartData/getRoleBasedChartData.useCase";
import { GetSubscriptionStatsDataUseCase } from "../../../application/useCases/admin/dashboard/stats/getSubscriptionStatsData.useCase";
import {
  getAdminBookingsChartDataUseCase,
  getProviderStatsDataUseCase,
  getSubscriptionStatsDataUseCase,
  getUserStatsDataUseCase,
  getBookingsStatsDataUseCase,
  getRoleBasedChartDataUseCase,
  getSubscriptionsChartDataUseCase,
} from "..";
import { GetSubscriptionsChartDataUseCase } from "../../../application/useCases/admin/dashboard/chartData/getSubscriptionsChartData.useCase";
import { AuthUser } from "../../../application/dtos/common.dto";

class DashboardController {
  constructor(
    private readonly getUserStatsDataUseCase: GetUserStatsDataUseCase,
    private readonly getProviderStatsDataUseCase: GetProviderStatsDataUseCase,
    private readonly getSubscriptionStatsDataUseCase: GetSubscriptionStatsDataUseCase,
    private readonly getBookingsStatsDataUseCase: GetBookingsStatsDataUseCase,
    private readonly getAdminBookingsChartDataUseCase: GetAdminBookingsChartDataUseCase,
    private readonly getRoleBasedChartDataUseCase: GetRoleBasedChartDataUseCase,
    private readonly getSubscriptionsChartDataUseCase: GetSubscriptionsChartDataUseCase,
  ) {
    this.getUserStats = this.getUserStats.bind(this);
    this.getProviderStats = this.getProviderStats.bind(this);
    this.getSubscriptionStats = this.getSubscriptionStats.bind(this);
    this.getBookingssStats = this.getBookingssStats.bind(this);
    this.getBookingsChartData = this.getBookingsChartData.bind(this);
    this.getUsersChartData = this.getUsersChartData.bind(this);
    this.getSubscriptionsChartData = this.getSubscriptionsChartData.bind(this);
  }

  async getUserStats(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as AuthUser;
      const validatedData = startAndEndDateSchema.parse(req.query);
      const result = await this.getUserStatsDataUseCase.execute({
        ...validatedData,
        timeZone: user.timeZone.value,
      });
      sendResponse(res, result);
    } catch (error) {
      log.error("getUserStats failed", { error });
      next(error);
    }
  }

  async getProviderStats(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as AuthUser;
      const validatedData = startAndEndDateSchema.parse(req.query);
      const result = await this.getProviderStatsDataUseCase.execute({
        ...validatedData,
        timeZone: user.timeZone.value,
      });
      sendResponse(res, result);
    } catch (error) {
      log.error("getProviderStats failed", { error });
      next(error);
    }
  }

  async getSubscriptionStats(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as AuthUser;
      const validatedData = startAndEndDateSchema.parse(req.query);
      const result = await this.getSubscriptionStatsDataUseCase.execute({
        ...validatedData,
        timeZone: user.timeZone.value,
      });
      sendResponse(res, result);
    } catch (error) {
      log.error("getSubscriptionStats failed", { error });
      next(error);
    }
  }

  async getBookingssStats(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as AuthUser;
      const validatedData = startAndEndDateSchema.parse(req.query);
      const result = await this.getBookingsStatsDataUseCase.execute({
        ...validatedData,
        timeZone: user.timeZone.value,
      });
      sendResponse(res, result);
    } catch (error) {
      log.error("getBookingssStats failed", { error });
      next(error);
    }
  }

  async getBookingsChartData(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as AuthUser;
      const validatedData = startAndEndDateSchema.parse(req.query);
      const result = await this.getAdminBookingsChartDataUseCase.execute({
        ...validatedData,
        timeZone: user.timeZone.value,
      });
      sendResponse(res, result);
    } catch (error) {
      log.error("getBookingsChartData failed", { error });
      next(error);
    }
  }

  async getUsersChartData(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as AuthUser;
      const validatedData = adminGetRoleBasedChartData.parse(req.query);
      const result = await this.getRoleBasedChartDataUseCase.execute({
        ...validatedData,
        timeZone: user.timeZone.value,
      });
      sendResponse(res, result);
    } catch (error) {
      log.error("getUserChartData failed", { error });
      next(error);
    }
  }

  async getSubscriptionsChartData(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as AuthUser;
      const validatedData = startAndEndDateSchema.parse(req.query);
      const result = await this.getSubscriptionsChartDataUseCase.execute({
        ...validatedData,
        timeZone: user.timeZone.value,
      });
      sendResponse(res, result);
    } catch (error) {
      log.error("getSubscriptionsChartData failed", { error });
      next(error);
    }
  }
}

export const dashboardController = new DashboardController(
  getUserStatsDataUseCase,
  getProviderStatsDataUseCase,
  getSubscriptionStatsDataUseCase,
  getBookingsStatsDataUseCase,
  getAdminBookingsChartDataUseCase,
  getRoleBasedChartDataUseCase,
  getSubscriptionsChartDataUseCase,
);

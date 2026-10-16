import { PlanName } from "../../../domain/enums/plan.enum";
import { Plan } from "../../../domain/entities/plan.entity";
import { ERROR_CODES } from "../../../shared/utils/types/enums";
import { toAppError } from "../../../shared/error/handleUnknownError";
import { CreatePlanInput, CreatePlanOutput } from "../../dtos/plan.dto";
import { AppError, BadRequestError } from "../../../shared/error/appError";
import { IStripePlanService } from "../../interfaces/services/IStripePlan.service";
import { IPlanRepository } from "../../../domain/interfaces/repositories/IPlan.repository";

export class CreatePlanUseCase {
  constructor(
    private readonly planRepository: IPlanRepository,
    private readonly stripePlanService: IStripePlanService,
  ) {}

  async execute(input: CreatePlanInput): Promise<CreatePlanOutput> {
    try {
      const {
        planName,
        description,
        monthlyPrice,
        yearlyPrice,
        features,
        maxBookingPerMonth,
        adVisibility,
        hasTrial,
        trialDays,
      } = input;
      if (!planName || !description || !features || !maxBookingPerMonth) {
        throw new BadRequestError();
      }

      const isTrial = planName === PlanName.TRIAL;

      if (isTrial && (monthlyPrice !== 0 || yearlyPrice !== 0)) {
        throw new BadRequestError("Trial plan must have zero pricing.");
      }

      if (!isTrial && (monthlyPrice <= 0 || yearlyPrice <= 0)) {
        throw new BadRequestError("Paid plans must have valid monthly and yearly prices.");
      }

      const existingPlan = await this.planRepository.findByName(planName);
      if (existingPlan) {
        throw new BadRequestError(
          `Plan with same name already exists.`,
          ERROR_CODES.PLAN_ALREADY_EXIST,
        );
      }

      const plan = Plan.create({
        planName,
        description,
        monthlyPrice,
        yearlyPrice,
        features,
        maxBookingPerMonth,
        adVisibility,
        hasTrial,
        trialDays,
      });

      const newPlan = await this.planRepository.create(plan);
      if (!newPlan) {
        throw new AppError("Internal server error", 500, true, ERROR_CODES.INTERNAL_ERROR);
      }

      const { createdAt: _ct, updatedAt: _ut, ...trialPlanData } = newPlan.getProps();

      if (isTrial) {
        return trialPlanData;
      }

      const stripePlan = await this.stripePlanService.createPlan({
        planName,
        description,
        monthlyPrice,
        yearlyPrice,
        features,
        maxBookingPerMonth,
      });

      newPlan.update({
        stripePlanDetails: {
          productId: stripePlan.productId,
          monthlyPriceId: stripePlan.monthlyPriceId,
          yearlyPriceId: stripePlan.yearlyPriceId,
        },
      });

      newPlan.stripeSynced();

      const newPlanResult = await this.planRepository.update(newPlan);
      if (!newPlanResult) {
        throw new AppError("Internal server error", 500, true, ERROR_CODES.INTERNAL_ERROR);
      }

      const {
        createdAt: _createdAt,
        updatedAt: _updatedAt,
        ...planData
      } = newPlanResult.getProps();

      return planData;
    } catch (error: unknown) {
      throw toAppError(error, "Failed to create plan");
    }
  }
}

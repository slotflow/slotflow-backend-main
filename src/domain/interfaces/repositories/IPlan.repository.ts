import { Plan } from "../../entities/plan.entity";

export interface IPlanRepository {

    create(plan: Plan): Promise<Plan>;

    findById(planId: string): Promise<Plan | null>;

    update(plan: Plan): Promise<Plan>;

    findByName(name: string): Promise<Plan | null>;

    findByPrice(price: number): Promise<Plan | null>;

}
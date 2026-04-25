import { Plan } from "../../entities/plan.entity";

export interface IPlanRepository {

    create(plan: Plan): Promise<Plan | null>;

    findById(planId: string): Promise<Plan | null>;

    update(plan: Plan): Promise<Plan | null>;

    findByNameOrPrice(name: string, price: number): Promise<Plan | null>;

    findAll(page?: number, limit?: number): Promise<{ data: Array<Plan>, totalPages: number; currentPage: number; totalCount: number; }>;

    findAllForDisplay(): Promise<Array<Plan>>;

};
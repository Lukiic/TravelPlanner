import type { AxiosResponse } from "axios";
import type { BudgetSummary } from "../types/BudgetSummary";
import type { CreateExpenseRequest } from "../types/CreateExpenseRequest";
import type { Expense } from "../types/Expense";

export interface IExpenseApi {
    getAll: (planId: string) => Promise<Expense[]>;
    create: (planId: string, data: CreateExpenseRequest) => Promise<Expense>;
    update: (planId: string, id: string, data: Partial<CreateExpenseRequest>) => Promise<Expense>;
    delete: (planId: string, id: string) => Promise<AxiosResponse<void>>;
    getBudgetSummary: (planId: string) => Promise<BudgetSummary>;
}
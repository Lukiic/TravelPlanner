import type { AxiosResponse } from "axios";
import type { ChecklistItem } from "../types/ChecklistItem";

export interface IChecklistApi {
    getAll: (planId: string) => Promise<ChecklistItem[]>;
    create: (planId: string, name: string) => Promise<ChecklistItem>;
    update: (planId: string, id: string, data: { name?: string; isCompleted?: boolean }) => Promise<ChecklistItem>;
    delete: (planId: string, id: string) => Promise<AxiosResponse<void>>;
    toggle: (planId: string, id: string, currentStatus: boolean) => Promise<ChecklistItem>;
}
import type { Activity } from "../../activity/types/Activity";
import type { ChecklistItem } from "../../checklist/types/ChecklistItem";
import type { Destination } from "../../destination/types/Destination";
import type { Expense } from "../../expense/types/Expense";
import type { AccessType } from "./AccessType";

export interface SharedPlan {
    id: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    budget: number;
    notes: string;
    createdAt: string;
}

export interface SharedPlanData {
    accessType: AccessType;
    plan: SharedPlan;
    destinations: Destination[];
    activities: Activity[];
    expenses: Expense[];
    checklist: ChecklistItem[];
}
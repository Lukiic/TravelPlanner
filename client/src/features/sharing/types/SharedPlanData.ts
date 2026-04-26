import type { Activity } from "../../activity/types/Activity";
import type { ChecklistItem } from "../../checklist/types/ChecklistItem";
import type { Destination } from "../../destination/types/Destination";
import type { Expense } from "../../expense/types/Expense";
import type { TravelPlan } from "../../travel-plan/types/TravelPlan";
import type { AccessType } from "./AccessType";

export interface SharedPlanData {
    accessType: AccessType;
    plan: TravelPlan;
    destinations: Destination[];
    activities: Activity[];
    expenses: Expense[];
    checklist: ChecklistItem[];
}
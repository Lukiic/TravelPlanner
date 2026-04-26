import type { TravelPlan } from "../../travel-plan/types/TravelPlan";

export interface AdminPlan extends TravelPlan {
    ownerEmail?: string;
}
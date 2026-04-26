import type { ActivityStatus } from "./ActivityStatus";

export interface Activity {
    id: string;
    travelPlanId: string;
    name: string;
    date: string;
    time: string;
    location: string;
    description: string;
    estimatedCost: number;
    status: ActivityStatus;
}
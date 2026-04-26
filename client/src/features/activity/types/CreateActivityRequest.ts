import type { ActivityStatus } from "./ActivityStatus";

export interface CreateActivityRequest {
    name: string;
    date: string;
    time: string;
    location: string;
    description: string;
    estimatedCost: number;
    status: ActivityStatus;
}
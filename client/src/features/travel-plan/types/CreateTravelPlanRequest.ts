export interface CreateTravelPlanRequest {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    budget: number;
    notes: string;
}

export type UpdateTravelPlanRequest = Partial<CreateTravelPlanRequest>; // Makes all properties of CreateTravelPlanRequest optional
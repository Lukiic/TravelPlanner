import type { AxiosResponse } from "axios";
import type { CreateTravelPlanRequest, UpdateTravelPlanRequest } from "../types/CreateTravelPlanRequest";
import type { TravelPlan } from "../types/TravelPlan";

export interface ITravelPlanApi {
    getAll: () => Promise<TravelPlan[]>;
    getById: (id: string) => Promise<TravelPlan>;
    create: (data: CreateTravelPlanRequest) => Promise<TravelPlan>;
    update: (id: string, data: UpdateTravelPlanRequest) => Promise<TravelPlan>;
    delete: (id: string) => Promise<AxiosResponse<void>>;
    exportPdf: (id: string) => Promise<Blob>;
}
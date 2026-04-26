import type { AxiosResponse } from "axios";
import type { CreateDestinationRequest } from "../types/CreateDestinationRequest";
import type { Destination } from "../types/Destination";

export interface IDestinationApi {
    getAll: (planId: string) => Promise<Destination[]>;
    create: (planId: string, data: CreateDestinationRequest) => Promise<Destination>;
    update: (planId: string, id: string, data: Partial<CreateDestinationRequest>) => Promise<Destination>;
    delete: (planId: string, id: string) => Promise<AxiosResponse<void>>;
}
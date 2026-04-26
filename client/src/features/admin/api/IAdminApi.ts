import type { AxiosResponse } from "axios";
import type { User } from "../../auth/types/User";
import type { TravelPlan } from "../../travel-plan/types/TravelPlan";
import type { CreateUserRequest } from "../types/CreateUserRequest";

export interface IAdminApi {
    getAllUsers: () => Promise<User[]>;
    deleteUser: (id: string) => Promise<AxiosResponse<void>>;
    createUser: (data: CreateUserRequest) => Promise<User>;
    getAllPlans: () => Promise<TravelPlan[]>;
    deletePlan: (id: string) => Promise<AxiosResponse<void>>;
}
import type { AxiosResponse } from "axios";
import type { AccessType } from "../types/AccessType";
import type { SharedPlanData } from "../types/SharedPlanData";
import type { ShareResponse } from "../types/ShareResponse";
import type { ShareToken } from "../types/ShareToken";

export interface ISharingApi {
    createToken: (planId: string, accessType: AccessType) => Promise<ShareResponse>;
    getTokens: (planId: string) => Promise<ShareToken[]>;
    revokeToken: (token: string) => Promise<AxiosResponse<void>>;
    getSharedPlan: (token: string) => Promise<SharedPlanData>;
    updateSharedActivity: (token: string, activityId: string, data: any) => Promise<any>;
}
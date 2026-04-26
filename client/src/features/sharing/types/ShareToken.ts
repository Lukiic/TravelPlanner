import type { AccessType } from "./AccessType";

export interface ShareToken {
    token: string;
    accessType: AccessType;
    travelPlanId: string;
    createdAt: string;
}
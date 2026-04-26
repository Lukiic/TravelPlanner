import type { AccessType } from "./AccessType";

export interface ShareResponse {
    token: string;
    qrCode: string;    // Base64 PNG
    accessType: AccessType;
}
import { Request } from 'express';

export interface GatewayRequest extends Request {
    wallet?: string;
    signature?: string;
    message?: string;
}
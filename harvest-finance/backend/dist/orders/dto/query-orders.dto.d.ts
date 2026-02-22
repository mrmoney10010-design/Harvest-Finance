import { OrderStatus } from '../order-status.enum';
export declare class QueryOrdersDto {
    page?: number;
    limit?: number;
    status?: OrderStatus;
    cropType?: string;
    search?: string;
    sort?: string;
    startDate?: string;
    endDate?: string;
}

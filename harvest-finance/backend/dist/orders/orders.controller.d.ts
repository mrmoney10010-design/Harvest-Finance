import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
export declare class OrdersController {
    private readonly service;
    constructor(service: OrdersService);
    create(req: any, dto: CreateOrderDto): Promise<import("./entities/order.entity").OrderEntity>;
    findAll(req: any, query: QueryOrdersDto): Promise<{
        items: import("./entities/order.entity").OrderEntity[];
        total: number;
    }>;
    findOne(id: string): Promise<import("./entities/order.entity").OrderEntity>;
    accept(req: any, id: string): Promise<import("./entities/order.entity").OrderEntity>;
}

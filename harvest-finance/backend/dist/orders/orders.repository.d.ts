import { OrderEntity } from './entities/order.entity';
export declare class OrdersRepository {
    private readonly logger;
    private items;
    create(data: Partial<OrderEntity>): Promise<OrderEntity>;
    findById(id: string): Promise<OrderEntity | undefined>;
    save(entity: OrderEntity): Promise<OrderEntity>;
    findAll(filter: {
        status?: string;
        cropType?: string;
        search?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
        sort?: string;
        role?: 'FARMER' | 'BUYER' | undefined;
        userId?: string | undefined;
    }): Promise<{
        items: OrderEntity[];
        total: number;
    }>;
}

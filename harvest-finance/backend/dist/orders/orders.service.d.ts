import { OrdersRepository } from './orders.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderEntity } from './entities/order.entity';
import { StellarService } from './stellar.service';
export declare class OrdersService {
    private repo;
    private stellar;
    constructor(repo: OrdersRepository, stellar: StellarService);
    create(buyer: {
        id: string;
        name: string;
    }, dto: CreateOrderDto): Promise<OrderEntity>;
    findAll(opts: any): Promise<{
        items: OrderEntity[];
        total: number;
    }>;
    findById(id: string): Promise<OrderEntity>;
    acceptOrder(orderId: string, farmer: {
        id: string;
        name: string;
        publicKey?: string;
    }): Promise<OrderEntity>;
}

import { OrderStatus } from '../order-status.enum';

export class OrderEntity {
  id: string;
  buyerId: string;
  buyerName: string;
  cropType: string;
  quantity: number;
  price: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  escrowTxHash?: string | null;

  constructor(partial: Partial<OrderEntity>) {
    Object.assign(this, partial);
  }
}

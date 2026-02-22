"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderEntity = void 0;
class OrderEntity {
    id;
    buyerId;
    buyerName;
    cropType;
    quantity;
    price;
    status;
    createdAt;
    updatedAt;
    escrowTxHash;
    constructor(partial) {
        Object.assign(this, partial);
    }
}
exports.OrderEntity = OrderEntity;
//# sourceMappingURL=order.entity.js.map
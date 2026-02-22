"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const orders_repository_1 = require("./orders.repository");
const order_status_enum_1 = require("./order-status.enum");
const stellar_service_1 = require("./stellar.service");
let OrdersService = class OrdersService {
    repo;
    stellar;
    constructor(repo, stellar) {
        this.repo = repo;
        this.stellar = stellar;
    }
    async create(buyer, dto) {
        const order = await this.repo.create({
            buyerId: buyer.id,
            buyerName: buyer.name,
            cropType: dto.cropType,
            quantity: dto.quantity,
            price: dto.price,
        });
        return order;
    }
    async findAll(opts) {
        return this.repo.findAll(opts);
    }
    async findById(id) {
        const order = await this.repo.findById(id);
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        return order;
    }
    async acceptOrder(orderId, farmer) {
        const order = await this.repo.findById(orderId);
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if (order.status !== order_status_enum_1.OrderStatus.PENDING)
            throw new common_1.ConflictException('Order not available for acceptance');
        order.status = order_status_enum_1.OrderStatus.ACCEPTED;
        await this.repo.save(order);
        try {
            const escrowTx = await this.stellar.createEscrow(order.buyerId, farmer.publicKey ?? '', String(order.price * order.quantity));
            order.escrowTxHash = escrowTx;
            order.status = order_status_enum_1.OrderStatus.IN_ESCROW;
            await this.repo.save(order);
            return order;
        }
        catch (err) {
            order.status = order_status_enum_1.OrderStatus.PENDING;
            order.escrowTxHash = null;
            await this.repo.save(order);
            throw new common_1.BadRequestException('Failed creating escrow');
        }
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [orders_repository_1.OrdersRepository, stellar_service_1.StellarService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map
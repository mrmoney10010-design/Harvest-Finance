"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var OrdersRepository_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersRepository = void 0;
const common_1 = require("@nestjs/common");
const order_entity_1 = require("./entities/order.entity");
const uuid_1 = require("uuid");
const order_status_enum_1 = require("./order-status.enum");
let OrdersRepository = OrdersRepository_1 = class OrdersRepository {
    logger = new common_1.Logger(OrdersRepository_1.name);
    items = [];
    async create(data) {
        const now = new Date();
        const entity = new order_entity_1.OrderEntity({
            id: (0, uuid_1.v4)(),
            status: order_status_enum_1.OrderStatus.PENDING,
            createdAt: now,
            updatedAt: now,
            escrowTxHash: null,
            ...data,
        });
        this.items.push(entity);
        return entity;
    }
    async findById(id) {
        return this.items.find((i) => i.id === id);
    }
    async save(entity) {
        const idx = this.items.findIndex((i) => i.id === entity.id);
        entity.updatedAt = new Date();
        if (idx === -1) {
            this.items.push(entity);
        }
        else {
            this.items[idx] = entity;
        }
        return entity;
    }
    async findAll(filter) {
        let res = this.items.slice();
        if (filter.status) {
            res = res.filter((r) => r.status === filter.status);
        }
        if (filter.cropType) {
            res = res.filter((r) => r.cropType === filter.cropType);
        }
        if (filter.search) {
            const s = filter.search.toLowerCase();
            res = res.filter((r) => r.cropType.toLowerCase().includes(s) || r.buyerName.toLowerCase().includes(s));
        }
        if (filter.startDate) {
            const sd = new Date(filter.startDate);
            res = res.filter((r) => r.createdAt >= sd);
        }
        if (filter.endDate) {
            const ed = new Date(filter.endDate);
            res = res.filter((r) => r.createdAt <= ed);
        }
        if (filter.role === 'FARMER') {
            res = res.filter((r) => r.status === order_status_enum_1.OrderStatus.PENDING);
        }
        if (filter.role === 'BUYER' && filter.userId) {
            res = res.filter((r) => r.buyerId === filter.userId);
        }
        const total = res.length;
        res.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        const page = filter.page ?? 1;
        const limit = filter.limit ?? 10;
        const start = (page - 1) * limit;
        const items = res.slice(start, start + limit);
        return { items, total };
    }
};
exports.OrdersRepository = OrdersRepository;
exports.OrdersRepository = OrdersRepository = OrdersRepository_1 = __decorate([
    (0, common_1.Injectable)()
], OrdersRepository);
//# sourceMappingURL=orders.repository.js.map
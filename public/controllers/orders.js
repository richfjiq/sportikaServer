"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOrdersByUser = exports.getOrderById = exports.createOrder = void 0;
const axios_1 = require("axios");
const database_1 = require("../database");
const models_1 = require("../models");
const mongoose_1 = require("mongoose");
const createOrder = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { orderItems, total } = req.body;
    const user = req.user;
    const productsIds = orderItems.map((product) => product._id);
    yield database_1.db.connect();
    const dbProducts = yield models_1.Product.find({ _id: { $in: productsIds } });
    try {
        const subTotal = orderItems.reduce((prev, current) => {
            var _a;
            const currentPrice = (_a = dbProducts.find(
            // data from db use product.id not product._id
            (product) => product.id === current._id)) === null || _a === void 0 ? void 0 : _a.price;
            if (currentPrice === undefined) {
                throw new Error('Verify the cart, product does not exist.');
            }
            return currentPrice * current.quantity + prev;
        }, 0);
        const taxRate = Number((_a = process.env.NEXT_PUBLIC_TAX_RATE) !== null && _a !== void 0 ? _a : 0);
        const backendTotal = subTotal * (taxRate + 1);
        if (total !== backendTotal) {
            res.status(400).json({ message: 'Total does not match.' });
            return;
        }
        const userId = user._id;
        const newOrder = new models_1.Order(Object.assign(Object.assign({}, req.body), { isPaid: false, user: userId }));
        newOrder.total = Math.round(newOrder.total * 100) / 100;
        yield newOrder.save();
        yield database_1.db.disconnect();
        res.status(201).json(newOrder);
    }
    catch (error) {
        yield database_1.db.disconnect();
        if (error instanceof axios_1.AxiosError) {
            res.status(400).json((_b = error.response) === null || _b === void 0 ? void 0 : _b.data.message);
            return;
        }
        if (error instanceof Error) {
            res.status(400).json({
                message: error.message,
            });
            return;
        }
    }
    yield database_1.db.disconnect();
    res.status(201).json(req.body);
});
exports.createOrder = createOrder;
const getOrderById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId } = req.params;
    if (!(0, mongoose_1.isValidObjectId)(orderId)) {
        res.status(400).json({
            message: 'Invalid id.',
        });
        return;
    }
    yield database_1.db.connect();
    const order = yield models_1.Order.findById(orderId).select('-__v -createdAt');
    yield database_1.db.disconnect();
    if (order === null) {
        res.status(400).json({
            message: 'Order not found.',
        });
        return;
    }
    res.status(201).json(order);
});
exports.getOrderById = getOrderById;
const getOrdersByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    if (!(0, mongoose_1.isValidObjectId)(userId)) {
        res.status(400).json({
            message: 'Invalid id.',
        });
        return;
    }
    yield database_1.db.connect();
    const orders = yield models_1.Order.find({ user: userId }).select('_id isPaid shippingAddress updatedAt');
    yield database_1.db.disconnect();
    res.status(201).json(orders);
});
exports.getOrdersByUser = getOrdersByUser;
//# sourceMappingURL=orders.js.map
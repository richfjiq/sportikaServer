"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const middlewares_1 = require("../middlewares");
const orders_1 = require("../controllers/orders");
const router = (0, express_1.Router)();
router.post('/', [middlewares_1.checkJWT], orders_1.createOrder);
router.get('/:orderId', [middlewares_1.checkJWT], orders_1.getOrderById);
router.get('/user/:userId', [middlewares_1.checkJWT], orders_1.getOrdersByUser);
router.put('/:orderId', [middlewares_1.checkJWT], orders_1.updateOrder);
exports.default = router;
//# sourceMappingURL=orders.js.map
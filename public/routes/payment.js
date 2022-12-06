"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_1 = require("../controllers/payment");
const middlewares_1 = require("../middlewares");
const router = (0, express_1.Router)();
router.get('/config', payment_1.getConfig);
router.post('/payment-sheet/:orderId', [middlewares_1.checkJWT], payment_1.paymentSheet);
exports.default = router;
//# sourceMappingURL=payment.js.map
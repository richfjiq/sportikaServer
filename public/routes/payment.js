"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_1 = require("../controllers/payment");
const router = (0, express_1.Router)();
router.get('/config', payment_1.getConfig);
exports.default = router;
//# sourceMappingURL=payment.js.map
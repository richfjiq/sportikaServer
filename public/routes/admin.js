"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_1 = require("../controllers/admin");
const router = (0, express_1.Router)();
router.get('/dashboard', admin_1.dashboardInfo);
router.get('/orders', admin_1.getOrders);
router.get('/products', admin_1.getProducts);
router.post('/products', admin_1.createProduct);
router.put('/products', admin_1.updateProduct);
router.post('/upload', admin_1.uploadFile);
router.get('/users', admin_1.getUsers);
router.put('/users', admin_1.updateUsers);
exports.default = router;
//# sourceMappingURL=admin.js.map
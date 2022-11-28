"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const products_1 = require("../controllers/products");
const router = (0, express_1.Router)();
router.get('/', products_1.getProducts);
router.get('/:slug', products_1.getProductBySlug);
exports.default = router;
//# sourceMappingURL=products.js.map
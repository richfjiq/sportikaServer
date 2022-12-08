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
exports.getProductBySlug = exports.getProducts = void 0;
const database_1 = require("../database");
const models_1 = require("../models");
const utils_1 = require("../utils");
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { gender = 'all' } = req.query;
    let condition = {};
    if (gender !== 'all' && utils_1.constants.SHOP_CONSTANTS.validGenders.includes(`${String(gender)}`)) {
        condition = { gender };
    }
    try {
        if (gender === 'all') {
            yield database_1.db.connect();
            const products = yield models_1.Product.find({}).select('title images price slug gender').lean();
            yield database_1.db.disconnect();
            res.status(200).json(products);
            return;
        }
        yield database_1.db.connect();
        const products = yield models_1.Product.find(condition).select('title images price slug gender').lean();
        yield database_1.db.disconnect();
        res.status(200).json(products);
    }
    catch (error) {
        yield database_1.db.disconnect();
        res.status(404).json({ message: 'Server Error.' });
    }
});
exports.getProducts = getProducts;
const getProductBySlug = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { slug } = req.params;
    try {
        yield database_1.db.connect();
        const product = yield models_1.Product.findOne({ slug })
            .select('gender title images price slug inStock description sizes _id')
            .lean();
        if (product === null) {
            res.status(404).json({
                message: 'Product not found.',
            });
            yield database_1.db.disconnect();
            return;
        }
        yield database_1.db.disconnect();
        res.status(200).json(product);
    }
    catch (error) {
        yield database_1.db.disconnect();
        res.status(404).json({
            message: 'Server Error.',
        });
    }
});
exports.getProductBySlug = getProductBySlug;
//# sourceMappingURL=products.js.map
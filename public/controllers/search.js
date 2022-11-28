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
exports.searchProducts = void 0;
const database_1 = require("../database");
const models_1 = require("../models");
const searchProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { q = '' } = req.query;
    if (q.length === 0) {
        res.status(400).json({
            message: 'You must specify the search query',
        });
        return;
    }
    q = String(q).toLowerCase();
    // q = q.toString().toLowerCase();
    yield database_1.db.connect();
    const products = yield models_1.Product.find({
        $text: { $search: q },
    })
        .select('title images price inStock slug -_id')
        .lean();
    yield database_1.db.disconnect();
    res.status(200).json(products);
});
exports.searchProducts = searchProducts;
//# sourceMappingURL=search.js.map
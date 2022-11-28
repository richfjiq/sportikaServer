"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const ProductSchema = new mongoose_1.Schema({
    description: { type: String, required: true, default: '' },
    images: [{ type: String }],
    inStock: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true, default: 0 },
    sizes: [
        {
            type: String,
            enum: {
                values: [
                    'XS',
                    'S',
                    'M',
                    'L',
                    'XL',
                    '2 years',
                    '3 years',
                    '4 years',
                    '5 years',
                    '5-6 years',
                    '7-8 years',
                    '9-10 years',
                    '11-12 years',
                    '13-14 years',
                    '15-16 years',
                    '5',
                    '5.5',
                    '6',
                    '6.5',
                    '7',
                    '7.5',
                    '8',
                    '8.5',
                    '9',
                    '9.5',
                    '10',
                    '10.5',
                    '11',
                    '11.5',
                    '12',
                    '12.5',
                    '13',
                    '13.5',
                    '14',
                    '1k',
                    '2k',
                    '3k',
                    '4k',
                    '5k',
                    '5.5k',
                    '6k',
                    '6.5k',
                    '7k',
                    '7.5k',
                    '8k',
                    '8.5k',
                    '9k',
                    '9.5k',
                    '10k',
                    '10.5k',
                    '11k',
                    '11.5k',
                    '12k',
                    '12.5k',
                    '13k',
                    '13.5k',
                    '1',
                    '1.5',
                    '2',
                    '2.5',
                    '3',
                    '3.5',
                    '4',
                    '4.5',
                ],
                message: '{VALUE} is not a valid size',
            },
        },
    ],
    slug: { type: String, required: true, unique: true },
    tags: [{ type: String }],
    title: { type: String, required: true, default: '' },
    type: {
        type: String,
        enum: {
            values: ['clothing', 'shoes'],
            message: '{VALUE} is not a valid type',
        },
        default: 'clothing',
    },
    gender: {
        type: String,
        enum: {
            values: ['men', 'women', 'girls', 'boys'],
            message: '{VALUE} is not a valid gender',
        },
        default: 'women',
    },
}, { timestamps: true });
ProductSchema.index({ title: 'text', tags: 'text' });
const Product = (_a = mongoose_1.default.models.Product) !== null && _a !== void 0 ? _a : (0, mongoose_1.model)('Product', ProductSchema);
exports.default = Product;
//# sourceMappingURL=Product.js.map
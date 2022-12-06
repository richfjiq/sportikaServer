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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentSheet = exports.getConfig = void 0;
const stripe_1 = require("stripe");
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("../database");
const models_1 = require("../models");
dotenv_1.default.config();
const secretKey = process.env.STRIPE_SECRET_KEY;
const stripe = new stripe_1.Stripe(secretKey, {
    apiVersion: '2022-11-15',
});
const getConfig = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY;
    const config = {
        publishableKey,
    };
    res.status(201).json(config);
});
exports.getConfig = getConfig;
const paymentSheet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orderId } = req.params;
    let customerId = '';
    try {
        yield database_1.db.connect();
        const order = yield models_1.Order.findById(orderId);
        const user = yield models_1.User.findById(order === null || order === void 0 ? void 0 : order.user);
        customerId = user === null || user === void 0 ? void 0 : user.customerIdStripe;
        if ((user === null || user === void 0 ? void 0 : user.customerIdStripe) === undefined) {
            const customer = yield stripe.customers.create();
            yield models_1.User.findByIdAndUpdate(order === null || order === void 0 ? void 0 : order.user, { customerIdStripe: customer.id });
            customerId = customer.id;
        }
        yield database_1.db.disconnect();
        const ephemeralKey = yield stripe.ephemeralKeys.create({ customer: customerId }, { apiVersion: '2020-03-02' });
        const paymentIntent = yield stripe.paymentIntents.create({
            amount: Number(order === null || order === void 0 ? void 0 : order.total) * 100,
            currency: 'usd',
            customer: customerId,
            automatic_payment_methods: {
                enabled: true,
            },
        });
        res.status(201).json({
            customer: customerId,
            ephemeralKey: ephemeralKey.secret,
            paymentIntent: paymentIntent.client_secret,
        });
    }
    catch (error) {
        yield database_1.db.disconnect();
        res.status(404).json({ message: 'Server Error.' });
    }
});
exports.paymentSheet = paymentSheet;
//# sourceMappingURL=payment.js.map
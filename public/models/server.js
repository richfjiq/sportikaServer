"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const admin_1 = __importDefault(require("../routes/admin"));
const address_1 = __importDefault(require("../routes/address"));
const orders_1 = __importDefault(require("../routes/orders"));
const products_1 = __importDefault(require("../routes/products"));
const search_1 = __importDefault(require("../routes/search"));
const user_1 = __importDefault(require("../routes/user"));
const payment_1 = __importDefault(require("../routes/payment"));
const middlewares_1 = require("../middlewares");
dotenv_1.default.config();
class Server {
    constructor() {
        var _a;
        this.apiPaths = {
            admin: '/api/admin',
            address: '/api/address',
            orders: '/api/orders',
            products: '/api/products',
            search: '/api/search',
            user: '/api/user',
            payment: '/api/payment',
        };
        this.app = (0, express_1.default)();
        this.port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : '8080';
        this.middlewares();
        this.routes();
    }
    listen() {
        this.app.listen(this.port, () => {
            // eslint-disable-next-line no-console
            console.log(`Server running on port ${this.port}`);
        });
    }
    middlewares() {
        // cors
        this.app.use((0, cors_1.default)());
        // body parser
        this.app.use(express_1.default.json());
    }
    routes() {
        this.app.use(this.apiPaths.admin, [middlewares_1.checkJWT, middlewares_1.isAdminRole], admin_1.default);
        this.app.use(this.apiPaths.address, address_1.default);
        this.app.use(this.apiPaths.orders, orders_1.default);
        this.app.use(this.apiPaths.products, products_1.default);
        this.app.use(this.apiPaths.search, search_1.default);
        this.app.use(this.apiPaths.user, user_1.default);
        this.app.use(this.apiPaths.payment, payment_1.default);
    }
}
exports.default = Server;
//# sourceMappingURL=server.js.map
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnect = exports.connect = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoConnection = {
    isConnected: 0,
};
const mongoUrl = (_a = process.env.MONGO_URL) !== null && _a !== void 0 ? _a : '';
const connect = () => __awaiter(void 0, void 0, void 0, function* () {
    if (mongoConnection.isConnected !== 0) {
        // eslint-disable-next-line no-console
        console.log('We were already connected');
        return;
    }
    if (mongoose_1.default.connections.length > 0) {
        mongoConnection.isConnected = mongoose_1.default.connections[0].readyState;
        if (mongoConnection.isConnected === 1) {
            // eslint-disable-next-line no-console
            console.log('Using previous connection');
            return;
        }
        yield mongoose_1.default.disconnect();
    }
    yield mongoose_1.default.connect(`${mongoUrl}`);
    mongoConnection.isConnected = 1;
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB:');
});
exports.connect = connect;
const disconnect = () => __awaiter(void 0, void 0, void 0, function* () {
    if (process.env.NODE_ENV === 'development')
        return;
    if (mongoConnection.isConnected === 0)
        return;
    yield mongoose_1.default.disconnect();
    mongoConnection.isConnected = 0;
    // eslint-disable-next-line no-console
    console.log('Disconnected from MongoDB');
});
exports.disconnect = disconnect;
//# sourceMappingURL=db.js.map
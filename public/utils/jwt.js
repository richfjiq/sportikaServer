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
exports.isValidToken = exports.signToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const signToken = (_id, email) => {
    if (process.env.JWT_SECRET_SEED === undefined) {
        throw new Error('There is no JWT seed - Check environment variables');
    }
    return jsonwebtoken_1.default.sign({ _id, email }, process.env.JWT_SECRET_SEED, {
        expiresIn: '30d',
    });
};
exports.signToken = signToken;
const isValidToken = (token) => __awaiter(void 0, void 0, void 0, function* () {
    if (process.env.JWT_SECRET_SEED === undefined) {
        throw new Error('There is no JWT seed - Check environment variables');
    }
    if (token.length <= 10) {
        return yield Promise.reject(new Error('JWT is not valid.'));
    }
    return yield new Promise((resolve, reject) => {
        var _a;
        try {
            jsonwebtoken_1.default.verify(token, (_a = process.env.JWT_SECRET_SEED) !== null && _a !== void 0 ? _a : '', (err, payload) => {
                if (err !== null)
                    return reject(new Error('JWT is not valid.'));
                const { _id } = payload;
                resolve(_id);
            });
        }
        catch (error) {
            reject(new Error('JWT is not valid.'));
        }
    });
});
exports.isValidToken = isValidToken;
//# sourceMappingURL=jwt.js.map
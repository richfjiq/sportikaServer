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
exports.getAddressByUser = exports.updateAddress = exports.createAddress = void 0;
const database_1 = require("../database");
const Address_1 = __importDefault(require("../models/Address"));
const createAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user, firstName, lastName, address, zip, city, state, country, code, phone } = req.body;
    try {
        yield database_1.db.connect();
        const userAddress = new Address_1.default({
            user,
            firstName,
            lastName,
            address,
            zip,
            city,
            state,
            country,
            code,
            phone,
        });
        yield userAddress.save();
        res.status(201).json(userAddress);
        yield database_1.db.disconnect();
    }
    catch (error) {
        yield database_1.db.disconnect();
        res.status(400).json({ message: 'Server error.' });
    }
});
exports.createAddress = createAddress;
const updateAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user, firstName, lastName, address, zip, city, state, country, code, phone } = req.body;
    try {
        yield database_1.db.connect();
        const obj = yield Address_1.default.find({ user });
        const userAddress = yield Address_1.default.findByIdAndUpdate(obj[0]._id, {
            user,
            firstName,
            lastName,
            address,
            zip,
            city,
            state,
            country,
            code,
            phone,
        }, { new: true });
        res.status(201).json(userAddress);
        yield database_1.db.disconnect();
    }
    catch (error) {
        yield database_1.db.disconnect();
        res.status(400).json({ message: 'Server error.' });
    }
});
exports.updateAddress = updateAddress;
const getAddressByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        yield database_1.db.connect();
        const userAddress = yield Address_1.default.find({ user: id }).select('-__v');
        res.status(201).json(userAddress);
        yield database_1.db.disconnect();
    }
    catch (error) {
        yield database_1.db.disconnect();
        res.status(400).json({ message: 'Server error.' });
    }
});
exports.getAddressByUser = getAddressByUser;
//# sourceMappingURL=address.js.map
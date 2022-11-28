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
exports.updateUsers = exports.getUsers = exports.uploadFile = exports.updateProduct = exports.createProduct = exports.getProducts = exports.getOrders = exports.dashboardInfo = void 0;
const mongoose_1 = require("mongoose");
const cloudinary_1 = require("cloudinary");
const formidable_1 = __importDefault(require("formidable"));
const database_1 = require("../database");
const models_1 = require("../models");
const dashboardInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.db.connect();
    const [numberOfOrders, paidOrders, numberOfClients, numberOfProducts, productsWithNoInventory, lowInventory,] = yield Promise.all([
        models_1.Order.find().count(),
        models_1.Order.find({ isPaid: { $eq: true } }).count(),
        models_1.User.find().count(),
        models_1.Product.find().count(),
        models_1.Product.find({
            inStock: { $eq: 0 },
        }).count(),
        models_1.Product.find({ inStock: { $lte: 30 } }).count(),
    ]);
    yield database_1.db.disconnect();
    res.status(200).json({
        numberOfOrders,
        paidOrders,
        notPaidOrders: numberOfOrders - paidOrders,
        numberOfClients,
        numberOfProducts,
        productsWithNoInventory,
        lowInventory,
    });
});
exports.dashboardInfo = dashboardInfo;
const getOrders = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.db.connect();
    const orders = yield models_1.Order.find()
        .sort({ createdAt: 'desc' })
        .populate('user', 'name email')
        .lean();
    yield database_1.db.disconnect();
    res.status(200).json(orders);
});
exports.getOrders = getOrders;
const getProducts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.db.connect();
    const products = yield models_1.Product.find().sort({ title: 'asc' }).lean();
    yield database_1.db.disconnect();
    res.status(200).json(products);
});
exports.getProducts = getProducts;
const createProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { images = [] } = req.body;
    if (images.length < 2) {
        res.status(400).json({ message: 'Product needs at least 2 images.' });
        return;
    }
    try {
        yield database_1.db.connect();
        const productInDb = yield models_1.Product.findOne({ slug: req.body.slug });
        if (productInDb !== null) {
            yield database_1.db.disconnect();
            res.status(400).json({ message: 'Product already exists.' });
            return;
        }
        const product = new models_1.Product(req.body);
        yield product.save();
        yield database_1.db.disconnect();
        res.status(201).json(product);
    }
    catch (error) {
        yield database_1.db.disconnect();
        res.status(400).json({ message: 'Check server logs.' });
    }
});
exports.createProduct = createProduct;
const updateProduct = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { _id = '', images = [] } = req.body;
    if (!(0, mongoose_1.isValidObjectId)(_id)) {
        res.status(400).json({ message: 'Product id is not valid.' });
        return;
    }
    if (images.length < 2) {
        res.status(400).json({ message: 'At least 2 images are required.' });
        return;
    }
    try {
        yield database_1.db.connect();
        const product = yield models_1.Product.findById(_id);
        if (product === null) {
            yield database_1.db.disconnect();
            res.status(400).json({ message: 'There is no product with this id.' });
            return;
        }
        // https://res.cloudinary.com/dlz1bhh8j/image/upload/v1659375333/sportika/ucfgfj3qylagifaen4hc.jpg
        product.images.forEach((image) => __awaiter(void 0, void 0, void 0, function* () {
            if (!images.includes(image)) {
                const [fileId] = image.substring(image.lastIndexOf('/') + 1).split('.');
                yield cloudinary_1.v2.uploader.destroy(`sportika/${fileId}`);
            }
        }));
        yield product.update(req.body);
        yield database_1.db.disconnect();
        res.status(200).json(product);
    }
    catch (error) {
        yield database_1.db.disconnect();
        res.status(400).json({ message: 'Check the server logs.' });
    }
});
exports.updateProduct = updateProduct;
const saveFile = (file) => __awaiter(void 0, void 0, void 0, function* () {
    const cloudinaryFile = yield cloudinary_1.v2.uploader.upload(file.filepath, {
        folder: 'sportika',
    });
    return cloudinaryFile.secure_url;
});
const parseFiles = (req) => __awaiter(void 0, void 0, void 0, function* () {
    return yield new Promise((resolve, reject) => {
        const form = new formidable_1.default.IncomingForm();
        form.parse(req, (err, fields, files) => __awaiter(void 0, void 0, void 0, function* () {
            // if (err) {
            if (err instanceof Error) {
                return reject(err);
            }
            const filePath = yield saveFile(files.file);
            resolve(filePath);
        }));
    });
});
const uploadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const imageUrl = yield parseFiles(req);
    res.status(200).json({ message: imageUrl });
});
exports.uploadFile = uploadFile;
const getUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.db.connect();
    const users = yield models_1.User.find().select('-password').lean();
    yield database_1.db.disconnect();
    res.status(200).json(users);
});
exports.getUsers = getUsers;
const updateUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId = '', role = '' } = req.body;
    if (!(0, mongoose_1.isValidObjectId)(userId)) {
        res.status(400).json({ message: 'There is no user with this id.' });
        return;
    }
    const validRoles = ['admin', 'client'];
    if (!validRoles.includes(role)) {
        res.status(404).json({ message: 'Role not allowed.' });
        return;
    }
    yield database_1.db.connect();
    const user = yield models_1.User.findById(userId);
    if (user === null) {
        yield database_1.db.disconnect();
        res.status(404).json({ message: `User not found: ${String(userId)}` });
        return;
    }
    user.role = role;
    yield user.save();
    yield database_1.db.disconnect();
    res.status(200).json({ message: 'Updated user.' });
});
exports.updateUsers = updateUsers;
//# sourceMappingURL=admin.js.map
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
const express = __importStar(require("express"));
const bodyParser = __importStar(require("body-parser"));
const database_1 = __importDefault(require("./database"));
const Item_1 = __importDefault(require("./models/Item"));
const cron = __importStar(require("node-cron"));
const app = express();
app.use(bodyParser.json());
app.listen(3000, () => __awaiter(void 0, void 0, void 0, function* () {
    yield database_1.default.sync();
    console.log('Server is running on port 3000');
}));
cron.schedule('0 * * * *', () => __awaiter(void 0, void 0, void 0, function* () {
    yield Item_1.default.destroy({ where: { expiry: { [Op.lt]: Date.now() } } });
    console.log('Expired items cleared');
}));
// Creating endpoints
//Post /add
app.post('/:item/add', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { item } = req.params;
    const { quantity, expiry } = req.body;
    yield Item_1.default.create({ name: item, quantity, expiry });
    res.status(201).send({});
}));
//Post /sell
app.post('/:item/sell', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { item } = req.params;
    const { quantity } = req.body;
    const items = yield Item_1.default.findAll({
        where: { name: item, expiry: { [Op.gt]: Date.now() } },
        order: [['expiry', 'ASC']],
    });
    let remainingQuantity = quantity;
    for (const item of items) {
        if (remainingQuantity <= 0)
            break;
        if (item.quantity <= remainingQuantity) {
            remainingQuantity -= item.quantity;
            yield item.destroy();
        }
        else {
            item.quantity -= remainingQuantity;
            yield item.save();
            remainingQuantity = 0;
        }
    }
    if (remainingQuantity > 0) {
        return res.status(400).send({ error: 'Not enough quantity' });
    }
    res.status(200).send({});
}));
//Get /quantity
app.get('/:item/quantity', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { item } = req.params;
    const items = yield Item_1.default.findAll({
        where: { name: item, expiry: { [Op.gt]: Date.now() } },
        order: [['expiry', 'ASC']],
    });
    const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const validTill = items.length > 0 ? items[0].expiry : null;
    res.status(200).send({ quantity, validTill });
}));

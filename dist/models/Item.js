"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize = new sequelize_1.Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite',
});
class Item extends sequelize_1.Model {
}
Item.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: new sequelize_1.DataTypes.STRING(128),
        allowNull: false,
    },
    quantity: {
        type: sequelize_1.DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
    },
    expiry: {
        type: sequelize_1.DataTypes.BIGINT.UNSIGNED,
        allowNull: false,
    },
}, {
    tableName: 'items',
    sequelize, // passing the `sequelize` instance is required
});
exports.default = Item;

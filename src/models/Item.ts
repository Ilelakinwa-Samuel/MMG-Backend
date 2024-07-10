import { DataTypes, Model, Optional, Sequelize } from 'sequelize';


const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: 'database.sqlite',
  });

interface ItemAttributes {
  id: number;
  name: string;
  quantity: number;
  expiry: number;
}

interface ItemCreationAttributes extends Optional<ItemAttributes, 'id'> {}

class Item extends Model<ItemAttributes, ItemCreationAttributes> implements ItemAttributes {
  public id!: number;
  public name!: string;
  public quantity!: number;
  public expiry!: number;
}

Item.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: new DataTypes.STRING(128),
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    expiry: {
      type: DataTypes.BIGINT.UNSIGNED,
      allowNull: false,
    },
  },
  {
    tableName: 'items',
    sequelize, // passing the `sequelize` instance is required
  }
);

export default Item;

import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface transactionsAttributes {
  id: number;
  type: string;
  time_stamp: string;
  hash: string;
  from: string;
  contract_address: string;
  currency?: string;
  amount: number;
  usd_price: number;
  usd_total: number;
  sell_price: number;
  total: number;
  status?: number;
}

export type transactionsPk = "id";
export type transactionsId = transactions[transactionsPk];
export type transactionsOptionalAttributes = "id" | "currency" | "status";
export type transactionsCreationAttributes = Optional<transactionsAttributes, transactionsOptionalAttributes>;

export class transactions extends Model<transactionsAttributes, transactionsCreationAttributes> implements transactionsAttributes {
  id!: number;
  type!: string;
  time_stamp!: string;
  hash!: string;
  from!: string;
  contract_address!: string;
  currency?: string;
  amount!: number;
  usd_price!: number;
  usd_total!: number;
  sell_price!: number;
  total!: number;
  status?: number;


  static initModel(sequelize: Sequelize.Sequelize): typeof transactions {
    transactions.init({
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    type: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    time_stamp: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    hash: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    from: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    contract_address: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    currency: {
      type: DataTypes.STRING(10),
      allowNull: true
    },
    amount: {
      type: DataTypes.DECIMAL(38,14),
      allowNull: false
    },
    usd_price: {
      type: DataTypes.DECIMAL(38,14),
      allowNull: false
    },
    usd_total: {
      type: DataTypes.DECIMAL(38,14),
      allowNull: false
    },
    sell_price: {
      type: DataTypes.DECIMAL(38,14),
      allowNull: false
    },
    total: {
      type: DataTypes.DECIMAL(38,14),
      allowNull: false
    },
    status: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'transactions',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
  return transactions;
  }
}

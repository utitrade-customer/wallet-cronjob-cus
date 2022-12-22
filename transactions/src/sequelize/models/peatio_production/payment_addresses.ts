import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface payment_addressesAttributes {
  id: number;
  member_id?: number;
  wallet_id?: number;
  address?: string;
  remote?: number;
  secret_encrypted?: string;
  details_encrypted?: string;
  created_at: Date;
  updated_at: Date;
}

export type payment_addressesPk = "id";
export type payment_addressesId = payment_addresses[payment_addressesPk];
export type payment_addressesCreationAttributes = Optional<payment_addressesAttributes, payment_addressesPk>;

export class payment_addresses extends Model<payment_addressesAttributes, payment_addressesCreationAttributes> implements payment_addressesAttributes {
  id!: number;
  member_id?: number;
  wallet_id?: number;
  address?: string;
  remote?: number;
  secret_encrypted?: string;
  details_encrypted?: string;
  created_at!: Date;
  updated_at!: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof payment_addresses {
    payment_addresses.init({
    id: {
      autoIncrement: true,
      type: DataTypes.BIGINT,
      allowNull: false,
      primaryKey: true
    },
    member_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    wallet_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    address: {
      type: DataTypes.STRING(95),
      allowNull: true
    },
    remote: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: 0
    },
    secret_encrypted: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    details_encrypted: {
      type: DataTypes.STRING(1024),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'payment_addresses',
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
      {
        name: "index_payment_addresses_on_member_id",
        using: "BTREE",
        fields: [
          { name: "member_id" },
        ]
      },
      {
        name: "index_payment_addresses_on_wallet_id",
        using: "BTREE",
        fields: [
          { name: "wallet_id" },
        ]
      },
    ]
  });
  return payment_addresses;
  }
}

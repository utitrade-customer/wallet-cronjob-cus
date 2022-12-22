import type { Sequelize, Model } from "sequelize";

import { payment_addresses } from "./payment_addresses";
import type {
  payment_addressesAttributes,
  payment_addressesCreationAttributes,
} from "./payment_addresses";

export { payment_addresses };

export type {
  payment_addressesAttributes,
  payment_addressesCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  payment_addresses.initModel(sequelize);

  return {
    payment_addresses: payment_addresses,
  };
}

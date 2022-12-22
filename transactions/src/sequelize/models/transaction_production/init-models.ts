import type { Sequelize } from "sequelize";
import { transactions } from "./transactions";
import type {
  transactionsAttributes,
  transactionsCreationAttributes,
} from "./transactions";

export { transactions };

export type { transactionsAttributes, transactionsCreationAttributes };

export function initModels(sequelize: Sequelize) {
  transactions.initModel(sequelize);

  return {
    transactions: transactions,
  };
}

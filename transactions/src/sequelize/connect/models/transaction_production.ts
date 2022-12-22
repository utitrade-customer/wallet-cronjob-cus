import { mysqlConfig } from "../../../shared";
import { transactionProd } from "../../models";
import { setUpSequelize } from "./initial";

export const transactionSequelize = setUpSequelize({
  database: mysqlConfig.transactionDbName,
});

export const transactionModel =
  transactionProd.initModels(transactionSequelize);

(async () => {
  try {
    await transactionSequelize.authenticate();
    console.log(
      "Connection has been established successfully. - transaction_production"
    );
  } catch (error) {
    console.error(
      "Unable to connect to the database - transaction_production:",
      error
    );
  }
})();

import { transactionModel, transactionProd } from "../sequelize";
import axios from "axios";
import { toInteger, toLower, toNumber, toUpper } from "lodash";
import {
  BSCSCAN_URL,
  BscTransactions,
  TransactionReceiptStatus,
} from "../shared";
import { CoinGeckoClient } from "coingecko-api-v3";
import firebase from "../shared/firebase";
import Big from "big.js";
import * as dotenv from "dotenv";
import { format } from "date-fns";
dotenv.config();

const FIREBASE_BSCSCAN_TRANSACTION_CONTRACT_ADDRESS_COLLECTION =
  "bscscanTransactionsContractAddressSetting";
const db = firebase.firestore();
const client = new CoinGeckoClient();
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export const checkTransactionStatus = async (hash: string) => {
  const {
    data: {
      result: { status },
    },
  } = await axios.get<TransactionReceiptStatus>(
    `${BSCSCAN_URL}?module=transaction&action=gettxreceiptstatus&txhash=${hash}&apikey=${process.env.BSCSCAN_API_KEY}`
  );
  await sleep(1000);
  const isSuccessTransaction = toNumber(status) === 1;
  return isSuccessTransaction;
};

const pullPrice = async (id: string, vs_currencies: string) => {
  const data = await client.simplePrice({
    ids: id,
    vs_currencies: vs_currencies,
  });
  return data[id][vs_currencies];
};

const fetchSettings = async () => {
  const configs = await db
    .collection(FIREBASE_BSCSCAN_TRANSACTION_CONTRACT_ADDRESS_COLLECTION)
    .orderBy("created_at")
    .get();

  const contractAddresses = configs.docs.map((doc) => {
    const { name, contract_address, fixed, value } = doc.data();
    return {
      name: toLower(name),
      contract_address: contract_address,
      fixed: fixed ? toNumber(fixed) : 0,
      value: value ? toNumber(fixed) : 0,
    };
  });
  return contractAddresses;
};

interface SuccessTransaction {
  timeStamp: string;
  hash: string;
  from: string;
  currency: string;
  amount: number;
  value: number;
  success: number;
  price: number;
  total: number;
  usd_total: number;
  contract_address: string;
}

interface FailTransaction {
  timeStamp: string;
  hash: string;
  from: string;
  value: string;
  contractAddress: string;
  error: string;
}

const getBscTransactionAddress = async () => {
  try {
    const bscscan = await db.doc("transactionSetting/bscscan").get();
    const { address } = bscscan.data() || { address: undefined };
    return address;
  } catch (error) {
    return undefined;
  }
};

export const scanTransactions = async () => {
  const address = await getBscTransactionAddress();

  if (!address) return;
  const configs = await fetchSettings();
  if (configs.length <= 0) return;
  const coinList = await client.coinList({});
  const {
    data: { result: transactions },
  } = await axios.get<BscTransactions>(
    `${BSCSCAN_URL}?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=1&offset=1000&sort=asc&apikey=${process.env.BSCSCAN_API_KEY}`
  );

  const successList: SuccessTransaction[] = [];
  const failList: FailTransaction[] = [];

  for (const transaction of transactions) {
    const { timeStamp, hash, from, value, contractAddress, to } = transaction;

    // check timestamp
    const time = new Date(
      new Date(toNumber(timeStamp) * 1000).toLocaleDateString("en-US")
    );
    if (time > new Date("2021-10-05")) {
      if (toLower(to) === toLower(address)) {
        try {
          const success = await checkTransactionStatus(hash);
          const config = configs.find(
            (config) =>
              toLower(config.contract_address) === toLower(contractAddress)
          );

          const currency = config ? toLower(config.name) : undefined;
          if (!currency) {
            throw new Error(` Not found currency`);
          }
          const fixed = config ? toInteger(config.fixed) : 18;
          const defaultValue = 0.000001;
          const { id } = coinList.find(
            (coin) => toLower(coin.symbol) === toLower(currency)
          ) || { id: "" };
          const vs_currencies = "usd";
          if (!id) {
            throw new Error("Can not find id coingecko-api-v3");
          }
          const valueDecimal = new Big(value).div(10 ** fixed);
          const price = await pullPrice(toLower(id), toLower(vs_currencies));
          const total = valueDecimal.times(price).div(defaultValue);
          const usdTotal = valueDecimal.times(price).toNumber();
          if (usdTotal > 0)
            successList.push({
              timeStamp,
              hash,
              from,
              currency: toUpper(currency),
              amount: valueDecimal.toNumber(),
              value: defaultValue,
              success: success ? 1 : 0,
              price: toNumber(price),
              total: total.toNumber(),
              contract_address: toLower(contractAddress),
              usd_total: usdTotal,
            });
        } catch (error) {
          const { message } = error as Error;
          failList.push({
            timeStamp,
            hash,
            from,
            value,
            contractAddress,
            error: message,
          });
        }
      }
    }
  }
  console.log("Fail List", failList);

  return [successList, failList];
};

export const startBSCNormal = async () => {
  try {
    console.log("Start BSCSCAN " + format(new Date(), "dd/MM/yyyy hh:mm:ss"));

    const list = await scanTransactions();
    const [successList, failList] = list || [[], []];
    for (let index = 0; index < successList.length; index++) {
      const transaction = successList[index];
      const {
        timeStamp,
        hash,
        from,
        value,
        amount,
        price,
        currency,
        success,
        total,
        contract_address,
        usd_total,
      } = transaction as SuccessTransaction;

      const isCreatedTransaction = await transactionModel.transactions.count({
        where: { hash: hash },
      });

      if (!isCreatedTransaction) {
        await transactionModel.transactions.create({
          type: "bscscan",
          time_stamp: timeStamp,
          hash: hash,
          from: from,
          sell_price: value,
          amount: amount,
          usd_price: price,
          currency: currency,
          status: success,
          usd_total: usd_total,
          total: total,
          contract_address: toLower(contract_address),
        });
      } else {
        if (success === 1) {
          await transactionModel.transactions.update(
            { status: success },
            { where: { hash: hash } }
          );
        }
      }
    }

    console.log("Finish BSCSCAN " + format(new Date(), "dd/MM/yyyy hh:mm:ss"));
  } catch (error) {
    console.log(error);
  }
};

export const startBep20 = async () => {
  console.log("Start bep20");
  try {
    const configs = await fetchSettings();
    if (configs.length <= 0) return;
    const coinList = await client.coinList({});
    const address = await getBscTransactionAddress();
    const successList = [];
    for (let i = 0; i < configs.length; i++) {
      const { name, contract_address, fixed } = configs[i];
      if (!(contract_address === "")) {
        const {
          data: { result: transactions },
        } = await axios.get<BscTransactions>(
          `${BSCSCAN_URL}?module=account&action=tokentx&contractaddress=${contract_address}&address=${address}&page=1&offset=1000&sort=asc&apikey=${process.env.BSCSCAN_API_KEY}`
        );

        for (let j = 0; j < transactions.length; j++) {
          const transaction = transactions[j];

          const { timeStamp, hash, from, value, contractAddress, to } =
            transaction;

          // check timestamp
          const time = new Date(
            new Date(toNumber(timeStamp) * 1000).toLocaleDateString("en-US")
          );
          if (time > new Date("2021-10-05")) {
            if (toLower(to) === toLower(address)) {
              try {
                const success = await checkTransactionStatus(hash);
                const currency = toLower(name);
                if (!currency) {
                  throw new Error(` Not found currency`);
                }
                const defaultValue = 0.000001;
                const { id } = coinList.find(
                  (coin) => toLower(coin.symbol) === toLower(currency)
                ) || { id: "" };
                const vs_currencies = "usd";
                if (!id) {
                  throw new Error("Can not find id coingecko-api-v3");
                }
                const valueDecimal = new Big(value).div(10 ** fixed);
                const price = await pullPrice(
                  toLower(id),
                  toLower(vs_currencies)
                );
                const total = valueDecimal.times(price).div(defaultValue);
                const usdTotal = valueDecimal.times(price).toNumber();
                if (usdTotal > 0) {
                  successList.push({
                    timeStamp,
                    hash,
                    from,
                    currency: toUpper(currency),
                    amount: valueDecimal.toNumber(),
                    value: defaultValue,
                    success: success ? 1 : 0,
                    price: toNumber(price),
                    total: total.toNumber(),
                    contract_address: toLower(contractAddress),
                    usd_total: usdTotal,
                  });
                }
              } catch (error) {
                console.log(error);
              }
            }
          }
        }
      }
    }
    for (let index = 0; index < successList.length; index++) {
      const transaction = successList[index];
      const {
        timeStamp,
        hash,
        from,
        value,
        amount,
        price,
        currency,
        success,
        total,
        contract_address,
        usd_total,
      } = transaction as SuccessTransaction;
      const isCreatedTransaction = await transactionModel.transactions.count({
        where: { hash: hash },
      });
      console.log(hash, success);
      if (!isCreatedTransaction) {
        await transactionModel.transactions.create({
          type: "bscscan",
          time_stamp: timeStamp,
          hash: hash,
          from: from,
          sell_price: value,
          amount: amount,
          usd_price: price,
          currency: currency,
          status: success,
          usd_total: usd_total,
          total: total,
          contract_address: contract_address,
        });
      } else {
        if (success === 1) {
          await transactionModel.transactions.update(
            { status: success },
            { where: { hash: hash } }
          );
        }
      }
    }

    console.log("Finish bep20");
  } catch (error) {
    console.log(error);
  }
};

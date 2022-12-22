import redis from "redis";
import { payment_addressesAttributes, peatioModel } from "../sequelize";
import axios from "axios";
import {
  Account,
  AccountResponse,
  ETHEREUM_REGREX,
  LIMIT,
  TokenResponse,
} from "../shared";
import * as dotenv from "dotenv";
import { isInteger, toNumber, toString } from "lodash";
import firebase from "../shared/firebase";
import { format } from "date-fns";
import { Sequelize } from "sequelize";
dotenv.config();
const ETHERSCAN_URL = "https://api.etherscan.io/api";

const client = redis.createClient({
  host: process.env.REDIS_HOSTNAME,
  port: toNumber(process.env.REDIS_PORT),
  password: process.env.REDIS_PASSWORD,
});
const db = firebase.firestore();
export const etherscan = async () => {
  console.log(
    `Etherscan is started ${format(new Date(), "dd/MM/yyyy hh:mm:ss")}`
  );
  try {
    const eSettings = await db
      .collection("eSetting")
      .orderBy("created_at")
      .get();
    const contractAddresses = eSettings.docs.map((doc) => {
      const { name, contract_address, fixed } = doc.data();
      return {
        name: toString(name),
        contract_address: toString(contract_address),
        fixed: fixed ? toNumber(fixed) : 0,
      };
    });

    const list = await peatioModel.payment_addresses.findAll({
      order: [["created_at", "DESC"]],
      attributes: [[Sequelize.fn("MAX", Sequelize.col("id")), "id"], "address"],
      group: ["address", "created_at"],
    });

    const addresses = list
      .map((row) => {
        const { address } = row.toJSON() as payment_addressesAttributes;
        return address === undefined ? "Invalid address" : address;
      })
      .filter((row) => {
        const re = new RegExp(ETHEREUM_REGREX);
        const isEthereumAddress = re.test(row);
        return isEthereumAddress;
      });
    const splitedAddresses: string[][] = [];
    while (addresses.length) {
      splitedAddresses.push(addresses.splice(0, LIMIT));
    }
    const accounts: Account[] = [];
    for (let i = 0; i < splitedAddresses.length; i++) {
      console.log(`[ETHERSCAN] Running: ${i + 1}/${splitedAddresses.length}`);
      for (let index = 0; index < splitedAddresses[i].length; index++) {
        const address = splitedAddresses[i][index];
        const tokens = [];

        for (let j = 0; j < contractAddresses.length; j++) {
          const { name, contract_address, fixed } = contractAddresses[j];
          let token;
          try {
            const {
              data: { result },
            } = await axios.get<TokenResponse>(
              `${ETHERSCAN_URL}?module=account&action=tokenbalance&contractaddress=${contract_address}&address=${address}&tag=latest&apikey=${process.env.ETHERSCAN_API_KEY}`
            );
            token = result;
          } catch (error) {
            token = "Error";
          }
          tokens.push({
            name: name,
            contract_address: contract_address,
            token: isInteger(toNumber(token))
              ? toString(toNumber(token) / 10 ** fixed)
              : token,
          });
        }

        let account;
        try {
          const {
            data: { result },
          } = await axios.get<AccountResponse>(
            `${ETHERSCAN_URL}?module=account&action=balance&address=${address}&tag=latest&apikey=${process.env.ETHERSCAN_API_KEY}`
          );
          account = result;
        } catch (error) {
          account = "Error";
        }

        accounts.push({
          account: address,
          balance: toNumber(account),
          token: tokens,
        });
      }
    }
    const sorted = accounts
      .sort((a, b) => toNumber(b.balance) - toNumber(a.balance))
      .map((a) => {
        return {
          ...a,
          balance: toNumber(a.balance) / 10 ** 18,
        };
      });
    client.set("ether_total", list.length.toString());
    client.set("ether_data", JSON.stringify(sorted));
    client.set("ether_updated", JSON.stringify(new Date()));
    console.log(
      `Etherscan is finised ${format(new Date(), "dd/MM/yyyy hh:mm:ss")}`
    );
  } catch (error) {
    console.log(error);
  }
};

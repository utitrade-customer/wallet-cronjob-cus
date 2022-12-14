export interface Transaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  blockHash: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  isError: string;
  txreceipt_status: string;
  input: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  gasUsed: string;
  confirmations: string;
}

export interface BscTransactions {
  status: string;
  message: string;
  result: Transaction[];
}

export interface TransactionReceiptStatus {
  status: string;
  message: string;
  result: {
    status: string;
  };
}

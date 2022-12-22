interface Token {
  name: string;
  contract_address: string;
  token: string;
}

export interface Account {
  account: string;
  balance: number;
  token: Token[];
}

export interface AccountResponse {
  status: string;
  message: string;
  result: string;
}

export interface TokenResponse {
  status: string;
  message: string;
  result: string;
}

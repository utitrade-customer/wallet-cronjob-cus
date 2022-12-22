import { Options } from 'sequelize/types';

export interface RootConfig {
  database: string;
  username: string;
  password: string;
  options: Options;
}

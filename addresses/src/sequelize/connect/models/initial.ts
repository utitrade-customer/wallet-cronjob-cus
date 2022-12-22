import { toNumber, toString } from 'lodash';
import { Options, Sequelize } from 'sequelize';
import { mysqlConfig } from '../../../shared';

export const setUpSequelize = (options: Options = {}) => {
  const sequelize = new Sequelize({
    host: toString(mysqlConfig.hostMysql),
    port: toNumber(mysqlConfig.portMysql),
    username: toString(mysqlConfig.userMysql),
    password: toString(mysqlConfig.passMysql),
    dialect: 'mysql',
    logging: false,
    ...options,
  });

  return sequelize;
};

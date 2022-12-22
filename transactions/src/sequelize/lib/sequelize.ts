import { Options, Sequelize } from 'sequelize';
import { mysqlConfig } from '../../shared';

export const setUpSequelize = (options: Options = {}) => {
  const sequelize = new Sequelize({
    host: mysqlConfig.hostMysql,
    port: +mysqlConfig.portMysql,
    username: mysqlConfig.userMysql,
    password: mysqlConfig.passMysql,
    dialect: 'mysql',
    ...options,
  });

  return sequelize;
};

import * as dotenv from 'dotenv';
dotenv.config();

export const mysqlConfig = {
  hostMysql: process.env.MYSQL_ENV_HOST,
  portMysql: process.env.MYSQL_ENV_PORT || 3306,
  userMysql: process.env.MYSQL_ENV_USER,
  passMysql: process.env.MYSQL_ENV_PASSWORD,
  peatioDbName: 'peatio_production',
  barongDbName: 'barong_production',
  referralDbName: 'referral_production',
};

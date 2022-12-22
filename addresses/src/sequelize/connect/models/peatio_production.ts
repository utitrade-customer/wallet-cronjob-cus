import { mysqlConfig } from '../../../shared';
import { peatioProd } from '../../models';
import { setUpSequelize } from './initial';

export const peatioSequelize = setUpSequelize({
  database: mysqlConfig.peatioDbName,
});

export const peatioModel = peatioProd.initModels(peatioSequelize);

(async () => {
  try {
    await peatioSequelize.authenticate();
    console.log(
      'Connection has been established successfully. - peatio_production',
    );
  } catch (error) {
    console.error(
      'Unable to connect to the database - peatio_production:',
      error,
    );
  }
})();

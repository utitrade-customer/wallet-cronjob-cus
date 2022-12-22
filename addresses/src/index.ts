import { setUpSequelize } from "./sequelize";
import { CronJob } from "cron";
import { etherscan } from "./controllers/etherscan";
import { bscscan } from "./controllers/bscscan";
setUpSequelize();

// run first build
setTimeout(() => {
  etherscan();
  bscscan();
}, 5000);

try {
  const etherscanCronjob = new CronJob(
    "0 */6 * * *",
    etherscan,
    null,
    true,
    "America/Los_Angeles"
  );

  etherscanCronjob.start();
} catch (error) {
  console.log(error);
}

try {
  const bscscanCronjob = new CronJob(
    "0 */6 * * *",
    bscscan,
    null,
    true,
    "America/Los_Angeles"
  );

  bscscanCronjob.start();
} catch (error) {
  console.log(error);
}

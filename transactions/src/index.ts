import { CronJob } from "cron";
import { startBSCNormal, startBep20 } from "./controllers/bscscan";

// run first build
setTimeout(() => {
  startBSCNormal();
  startBep20();
}, 2000);

try {
  const bsccanCronjob = new CronJob(
    "*/5 * * * *",
    startBSCNormal,
    null,
    true,
    "America/Los_Angeles"
  );

  bsccanCronjob.start();

  const bep20Cronjob = new CronJob(
    "*/5 * * * *",
    startBep20,
    null,
    true,
    "America/Los_Angeles"
  );

  bep20Cronjob.start();
} catch (error) {
  console.log(error);
}

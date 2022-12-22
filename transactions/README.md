# 🧰 Cronjob | 2021

### Scripts

#### `npm run start:dev`

Starts the application in development using `nodemon` and `ts-node` to do hot reloading.

#### `npm run start`

Starts the app in production by first building the project with `npm run build`, and then executing the compiled JavaScript at `build/index.js`.

#### `npm run build`

Builds the app at `build`, cleaning the folder first.

#### `npm run test`

Runs the `jest` tests once.

#### `npm run test:dev`

Run the `jest` tests in watch mode, waiting for file changes.

#### `npm run prettier-format`

Format your code.

#### `npm run prettier-watch`

Format your code in watch mode, waiting for file changes.

### Enviroment Variables
`
    FIREBASE_API_KEY=xxxxxxxxxxxxxxxx
    FIREBASE_AUTH_DOMAIN=zozitech-wallet-scan.firebaseapp.com
    FIREBASE_PROJECT_ID=zozitech-wallet-scan
    FIREBASE_STORAGE_BUCKET=zozitech-wallet-scan.appspot.com
    FIREBASE_MESSAGING_SENDER_ID=194728054229
    FIREBASE_APP_ID=1:194728054229:web:47f7ab6f9865595843815c
    REDIS_PASSWORD=xxxxxxxxxxxxxxxx
    REDIS_PORT=12345
    REDIS_HOSTNAME=redis-12345.c252.ap-southeast-1-1.ec2.cloud.redislabs.com
    MYSQL_ENV_HOST=128.199.217.33
    MYSQL_ENV_PORT=3306
    MYSQL_ENV_USER=root
    MYSQL_ENV_PASSWORD=Quy1407@
    BSCSCAN_API_KEY=xxxxxxxxxxxxxxxx
    ETHERSCAN_API_KEY=xxxxxxxxxxxxxxxx
`

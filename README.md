# orai-tracking-lp-backend

## setting
```
1. npm i
2.sudo npm install pm2 -g
```

```
2. change config db
```
nano  orai-tracking/app/database/db_config.js

change variable ```dbs``` with your host mongo  

3.change config abi and pool
```nano orai-tracking/app/blockchain/abi/orai_pool.json```

copy abi smart contract pool of you to replace orai_pool.json

```nano orai-tracking/app/woker/oraiEvent.js```

change variable ```ADDRESS_POOL``` at line 10 by pool of you

## run
```pm2 start app/woker/oraiEvent.js```
```pm2 start server.js```
# orai-tracking-lp-backend

## setting

```
1. npm i
```
```
2.sudo npm install pm2 -g
```
```
3. change config db
nano  orai-tracking/app/database/db_config.js
change variable ```dbs``` with your host mongo  
```
```
4.change config abi and pool
nano orai-tracking/app/blockchain/abi/orai_pool.json

copy abi smart contract pool of you to replace orai_pool.json
nano orai-tracking/app/woker/oraiEvent.js

change variable ```ADDRESS_POOL``` at line 10 by pool of you
```
## run
```
pm2 start app/woker/oraiEvent.js
pm2 start server.js
```

## note
```
If want to tracking event by subgrapb. Create file .env. config variable TIMESTAMP_START_EVENT 
eg :TIMESTAMP_START_EVENT=1608430000 and pool event ADDRESS_POOL 
eg: ADDRESS_POOL=0x9081b50bad8beefac48cc616694c26b027c559bb
```
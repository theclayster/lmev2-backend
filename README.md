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

## env 
```
ALGORITHM_JWT=HS256
ACCESS_TOKEN_SECRET=orai
ACCESS_TOKEN_LIFE_RESET_PASSWORD=3h
TIMESTAMP_START_EVENT=
ADDRESS_POOL=
```


## run worker mapDBAndEth
tại dòng 15. Config 2 giá trị đầu tiền là thời gian sẽ check toàn bộ tx remove trên eth và address pool mà mình muốn check
const TIME_STAMP_START = 1608430000;
const ADDRESS_POOL = "0x9081b50bad8beefac48cc616694c26b027c559bb";

## run worker report 14 day

trong file /app/database/db_config.js 
tạo biến db_14_day = "url", cẩn thận là database test hơn là live.
chạy node report14day.js
sau khi chạy xong backup db sẽ được lưu vào ./backupDB
các file report sẽ được lưu ./report14day

## run worker claim
trong file /app/database/db_config.js 
tạo biến db_claim = "url", cẩn thận là database test hơn là live.
trong ./worker_config/claimWorker.js điền block number bắt đầu. Hiện tại block number lên là 11620095
chạy node claimWorker.js


## Cách sử dụng api claim 
Vào thư mục ./app/woker/claimDB/claims.json
Import file claims vào mongodb với collection là claims


## link postman
https://www.getpostman.com/collections/fec57179660d03bf1b7c
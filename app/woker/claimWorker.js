const TIME_CRON_JOB = 300000; // 5phut
const LockRewardDB = require("../database/lock_reward");
const dbConfig = require("../database/db_config").db_claim;

const requestPromise = require("request-promise");
var fs = require("fs");
const eth_network = require("../blockchain/network/eth");
const web3 = eth_network.get_lib_main_net();
const mongoose = require("mongoose");
const util = require("util");
const readFile = util.promisify(fs.readFile);
const ABI = require("./worker_config/ABI");
const InputDataDecoder = require("ethereum-input-data-decoder");
const decoder = new InputDataDecoder(ABI.Reward_Contract.ABI);

// config mongo
mongoose.connect(dbConfig, {
  useNewUrlParser: true,
});
// block_numner = 11620095
const ADDRESS = "0x3d5c50f93c6b307de88b4c63212cca746673278f";
async function claimWork() {
  setInterval(async function () {
    block_number = await readFile("./worker_config/claimWorker.json", "binary");
    console.log("daaaaa", block_number);

    url_query =
      "https://api.etherscan.io/api?module=account&action=txlist&address=" +
      ADDRESS +
      "&startblock=" +
      block_number +
      "&endblock=99999999&sort=asc&apikey=PJZTHQZRS1MTRUHTUHVHVYKBYX1RQVGPXP";
    // 11621737
    get_tx = await requestPromise.get(url_query);

    data_tx = JSON.parse(get_tx).result;
    blockNumber = 0;
    for (let i = 0; i < data_tx.length; i++) {
      console.log(data_tx[i].hash);
      data = await web3.eth.getTransaction(data_tx[i].hash);
      input_data = data.input;

      result = await decoder.decodeData(input_data);

      if (
        result.method == "claim" &&
        result.inputs[0] == "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa1"
      ) {
        get_data_account = await LockRewardDB.findOne({
          address: data_tx[i].from,
        });
        console.log("so chua update", get_data_account.seedSale);

        seedSaleUpdate =
          Number(get_data_account.seedSale) -
          Number(web3.utils.hexToNumberString(result.inputs[1])) /
            Math.pow(10, 18);

        await LockRewardDB.findByIdAndUpdate(
          get_data_account._id,
          {
            address: get_data_account.address,
            seedSale: seedSaleUpdate,
            ORAIVault: get_data_account.ORAIVault,
            USDTVault: get_data_account.USDTVault,
          },
          { new: true, upsert: true }
        );
      }

      if (
        result.method == "claim" &&
        result.inputs[0] == "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb1"
      ) {
        get_data_account = await LockRewardDB.findOne({
          address: data_tx[i].from,
        });

        ORAIVaultUpdate =
          Number(get_data_account.ORAIVault) -
          Number(web3.utils.hexToNumberString(result.inputs[1])) /
            Math.pow(10, 18);

        await LockRewardDB.findByIdAndUpdate(
          get_data_account._id,
          {
            address: get_data_account.address,
            seedSale: get_data_account.seedSale,
            ORAIVault: ORAIVaultUpdate,
            USDTVault: get_data_account.USDTVault,
          },
          { new: true, upsert: true }
        );
      }
      if (
        result.method == "claim" &&
        result.inputs[0] == "ccccccccccccccccccccccccccccccccccccccc1"
      ) {
        get_data_account = await LockRewardDB.findOne({
          address: data_tx[i].from,
        });

        USDTVaultUpdate =
          Number(get_data_account.USDTVault) -
          Number(web3.utils.hexToNumberString(result.inputs[1])) /
            Math.pow(10, 18);

        await LockRewardDB.findByIdAndUpdate(
          get_data_account._id,
          {
            address: get_data_account.address,
            seedSale: get_data_account.seedSale,
            ORAIVault: get_data_account.ORAIVault,
            USDTVault: USDTVaultUpdate,
          },
          { new: true, upsert: true }
        );
      }

      blockNumber = data_tx[i].blockNumber;
    }
    console.log(blockNumber);

    fs.writeFile(
      "./worker_config/claimWorker.json",
      blockNumber,
      "utf8",
      function (err) {
        if (err) throw err;
        else console.log("Ghi file claimWorker config thanh cong!");
      }
    );
  }, TIME_CRON_JOB);
}

claimWork();

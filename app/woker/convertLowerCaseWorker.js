const UniswapDB = require("../database/uniswap");
const dbConfig = require("../database/db_config").dbs;
var fs = require("fs");
const mongoose = require("mongoose");
// config mongo
mongoose.connect(dbConfig, {
  useNewUrlParser: true,
});

async function convertLowercase() {
  get_all_data = await UniswapDB.find();
  list_address_lowercase = [];

  for (let i = 0; i < get_all_data.length; i++) {
    var count = 0;
    while (count <= get_all_data[i].address.length) {
      character = get_all_data[i].address.charAt(count);

      if (character == character.toUpperCase() && isNaN(character)) {
      
        await UniswapDB.updateOne(
          { _id: get_all_data[i]._id },
          { $set: { address: get_all_data[i].address.toLowerCase() } }
        );
        list_address_lowercase.push(get_all_data[i].address);
        break;
      }

      count++;
    }
  }
  //   console.log(list_address_lowercase);
  fs.writeFile(
    "./address/address_upcase.json",
    JSON.stringify(list_address_lowercase),
    "utf8",
    function (err) {
      if (err) throw err;
      else console.log("Ghi file address_upcase thanh cong!");
    }
  );
}

convertLowercase();

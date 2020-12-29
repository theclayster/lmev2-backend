const jwtHelper = require("../helpers/jwt_helper");
require("dotenv").config();
module.exports = {
  gen_token: async (req, res, next) => {
    let token = await jwtHelper.generateToken(
      "orai",
      process.env.ACCESS_TOKEN_SECRET,
      process.env.ACCESS_TOKEN_LIFE_RESET_PASSWORD
    );

    return res.status(200).send({ status: 200, token });
  },
};

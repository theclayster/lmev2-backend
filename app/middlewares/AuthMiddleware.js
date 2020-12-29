const jwtHelper = require("../../app/helpers/jwt_helper");
require("dotenv").config();

module.exports = {
  classname: "AuthMiddleware",
  isAuth: async (req, res, next) => {
    const tokenFromClient =
      req.headers["Authorization"] ||
      req.body.token ||
      req.query.token ||
      req.headers["x-access-token"];

    if (tokenFromClient) {
      try {
        const decoded = await jwtHelper.verifyToken(
          tokenFromClient,
          process.env.ACCESS_TOKEN_SECRET
        );

        next();
      } catch (error) {
        return res.status(200).json({
          status: 403,
          message: "Unauthorized.",
        });
      }
    } else {
      // Không tìm thấy token trong request
      return res.status(200).send({
        status: 403,
        message: "No token provided.",
      });
    }
  },
};

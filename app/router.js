const express = require("express");
const router = express.Router();
const { body, validationResult, param } = require("express-validator");
const eventHandler = require("./controller/event_handler");
const trackingHistory = require("./controller/tracking_history");
const uniswap = require("./controller/uniswap");
const token = require("./controller/token");
const middleWare = require("./middlewares/AuthMiddleware");

router.get(
  "/v1/:account/tracking_event",
  [param("account").notEmpty().withMessage("account empty")],
  eventHandler.tracking_lp_event
);

router.get(
  "/v2/:account/tracking_event",
  [param("account").notEmpty().withMessage("account empty")],
  eventHandler.tracking_lp_event_v2
);

router.post(
  "/v1/:account/history",
  [
    body("from_timestamp").notEmpty().withMessage("from empty"),
    body("to_timestamp").notEmpty().withMessage("to empty"),
    param("account").notEmpty().withMessage("account empty"),
  ],
  trackingHistory.tracking_history
);

router.post(
  "/v0/uniswap_liquidity",
  [
    body("type").notEmpty().withMessage("type empty"),
    body("address").notEmpty().withMessage("address empty"),
    body("amount").notEmpty().withMessage("amount empty"),
    body("vault").notEmpty().withMessage("vault empty"),
    body("txid").notEmpty().withMessage("txid empty"),
  ],
  uniswap.uniswap_liquidity
);

router.get(
  "/v0/:account/uniswap_liquidity",
  [param("account").notEmpty().withMessage("account empty")],
  uniswap.get_uniswap_liquidity
);

router.post(
  "/v1/uniswap_liquidity",
  [
    body("type").notEmpty().withMessage("type empty"),
    body("address").notEmpty().withMessage("address empty"),
    body("amount").notEmpty().withMessage("amount empty"),
    body("vault").notEmpty().withMessage("vault empty"),
    body("txid").notEmpty().withMessage("txid empty"),
  ],
  middleWare.isAuth,
  uniswap.uniswap_liquidity_v1
);

router.get(
  "/v1/:account/uniswap_liquidity",
  [param("account").notEmpty().withMessage("account empty")],
  middleWare.isAuth,
  uniswap.get_uniswap_liquidity
);

// router.post(
//   "/v0/get_list_reward",
//   [body("vault").notEmpty().withMessage("vault empty")],
//   uniswap.get_list_reward
// );

router.get("/v0/get_token", token.gen_token);

module.exports = router;

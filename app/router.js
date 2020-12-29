const express = require("express");
const router = express.Router();
const { body, validationResult, param } = require("express-validator");
const eventHandler = require("./controller/event_handler");
const trackingHistory = require("./controller/tracking_history");
const uniswap = require("./controller/uniswap");
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
  "/v0/:account/uniswap_liquidity",[
    param("account").notEmpty().withMessage("account empty")
  ],
  uniswap.get_uniswap_liquidity
);

module.exports = router;

const express = require("express");
const router = express.Router();
const { body, validationResult, param } = require("express-validator");
const eventHandler = require("./controller/event_handler");
const trackingHistory = require("./controller/tracking_history");

router.get("/v1/:account/tracking_event", [
    param("account")
        .notEmpty()
        .withMessage("account empty"),
], eventHandler.tracking_lp_event);


router.get("/v2/:account/tracking_event", [
    param("account")
        .notEmpty()
        .withMessage("account empty"),
], eventHandler.tracking_lp_event_v2);

router.post("/v1/:account/history", [
    body("from_timestamp")
        .notEmpty()
        .withMessage("from empty"),
    body("to_timestamp")
        .notEmpty()
        .withMessage("to empty"),
    param("account")
        .notEmpty()
        .withMessage("account empty"),
], trackingHistory.tracking_history);



module.exports = router;

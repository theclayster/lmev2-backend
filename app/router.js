const express = require("express");
const router = express.Router();
const { body, validationResult, param } = require("express-validator");
const eventHandler = require("./controller/event_handler");


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


module.exports = router;

const { validationResult, check } = require("express-validator");
const OraiEnventDB = require("../database/orai_event");
const { get } = require("../router");

module.exports = {
    tracking_lp_event: async (req, res, next) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                let error = errors.errors;
                return res.status(200).send({ status: 500, error });
            }

            account = req.params.account
            get_all_account = await OraiEnventDB.find({ 'from_address': account })

            if (get_all_account.length > 0) {
                return res.status(200).send({ status: 200, data: get_all_account });
            } else {
                return res.status(200).send({ status: 200, data: [] });
            }
        } catch (error) {
            return res.status(200).send({ status: 500, error });
        }

    }
}  
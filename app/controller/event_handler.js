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
            get_all_account = await OraiEnventDB.find({ 'from': account })

            if (get_all_account.length > 0) {
                data_resp = []
                for (let i = 0; i < get_all_account.length; i++) {
                    data_resp.push({
                        "from": get_all_account[i].from,
                        "to": get_all_account[i].to,
                        "pool": get_all_account[i].address_pool,
                        "amount": get_all_account[i].amount,
                        "createAt": get_all_account[i].createAt,
                    })
                }
                return res.status(200).send({ status: 200, data: data_resp });
            } else {
                return res.status(200).send({ status: 200, data: [] });
            }
        } catch (error) {
            return res.status(200).send({ status: 500, error });
        }

    }
}  
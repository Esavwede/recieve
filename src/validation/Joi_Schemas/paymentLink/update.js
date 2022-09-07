const Joi = require('joi') 


const paymentLinkUpdateSchema = Joi.object
            (
                {
                    name: Joi.string(),
                    amount: Joi.number(), 
                    description: Joi.string().min(7)
                }
            )


module.exports = paymentLinkUpdateSchema 
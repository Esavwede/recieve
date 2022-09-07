const Joi = require('joi')


const paymentLinkSchema = Joi.object
        (
            {
                name: Joi.string().min(5).required(),
                amount: Joi.string().required(), 
                description: Joi.string().min(7).required(), 
                currency: Joi.string().max(3).min(3).required(),
                redirec_url: Joi.string().required(), 
                custom_name: Joi.string().required()
            }
        )


module.exports = paymentLinkSchema 
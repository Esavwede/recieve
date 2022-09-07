const Joi = require('joi') 


const loginSchema = Joi.object
    (
        {
            email: Joi.string().min(2).required(),
            password: Joi.string().min(5).required() 
        }
    )


module.exports = loginSchema 
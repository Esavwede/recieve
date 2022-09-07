const Joi = require('joi') 


const signupSchema = Joi.object
        (
            {
                firstname: Joi.string().min(2).required(), 
                lastname:  Joi.string().min(2).required(),
                email:     Joi.string().min(2).required(), 
                password:  Joi.string().min(5).required(),
                repeat_password: Joi.ref('password') 
            }
        )


module.exports = signupSchema 
require('dotenv').config() 
const logger = require('../../health/logging/index')
const { serverErrorResponse } = require('../../utils/response/res_500')

const view = async function(req, res,next)
        {
            try 
            {

            }
            catch(err)
            {
                logger.info(err)
                return serverErrorResponse(' Error occured while getting balance ',res)
            }
        } 


module.exports = { view } 


require('dotenv').config()


// Utils 
const logger = require('../../health/logging/index')
const { serverErrorResponse } = require('../../utils/response/res_500')

// Modules 
const flutterwave = require('flutterwave-node-v3')
const flw = new flutterwave( process.env.FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY )



const verifyDestinationAccount = async function(req, res, next)
        {
            try 
            {
                    const account_details = { account_bank: req.body.account_bank, account_number: req.body.account_number } 
                    const response = await flw.Misc.verify_Account(account_details)

                    if( response.status === 'success' )
                    {
                        logger.info(' Bank account details valid ')
                        return res.status(200).json({ "success": true, data })
                    }

                        return res.status(400).json({ "success": false, "msg":" Check Account details and try again "})
 
            }
            catch(err)
            {
                logger.error(err)
                return serverErrorResponse(' Error occured while verifying transfer account ',res)
            }
        }



        

module.exports = { verifyDestinationAccount }
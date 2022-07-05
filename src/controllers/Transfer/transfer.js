require('dotenv').config()


// Utils 
const logger = require('../../health/logging/index')
const { serverErrorResponse } = require('../../utils/response/res_500')

// Modules 
const axios = require('axios') 
const flutterwave = require('flutterwave-node-v3')
const flw = new flutterwave( process.env.FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY )



const verifyDestinationAccount = async function(req, res, next)
        {
            try 
            {
                    const { account_bank, account_number } = req.body 
                    const account_details = { account_bank , account_number} 


                    const response = await flw.Misc.verify_Account(account_details)

                    if( response.status === 'success' )
                    {
                        logger.info(' Bank account details valid ')
                        return res.status(200).json({ "success": true, data: response.data })
                    }

                        return res.status(400).json({ "success": false, "msg":" Check Account details and try again "})
 
            }
            catch(err)
            {
                logger.error(err)
                return serverErrorResponse(' Error occured while verifying transfer account ',res)
            }
        }


const getTransactionFee = async function(req, res, next)
        {
            try 
            {

                const { amount, currency } = req.body 
                const response = await flw.Transfer.fee({
                    type:'account',
                    amount, 
                    currency
                  })

                  

                if( response.status === 'success' )
                {
                    const { currency, fee }  = response.data[0]
                    const transferData = { currency, transferFee: fee } 
                    return res.status(200).json({ "success": true, transferData })
                }


                    return res.status(200).json({ "success": false, "msg":" could not get transfer fee"})
            }
            catch(err)
            {
                logger.error(err)
                return serverErrorResponse(' Server encountered error while getting transaction fee ',res) 
            }
        }



const getTransactionRate = async function(req, res, next)
        {
            try 
            {
                const { destination_amount, destination_currency, source_currency } = req.body 
 const response = 
 await axios.get(`https://api.flutterwave.com/v3/transfers/rates?amount=${ destination_amount}&destination_currency=${destination_currency}&source_currency=${source_currency}`, 
                    {
                           headers: {
                                     'Authorization': `Bearer ${ process.env.FLUTTERWAVE_SECRET_KEY }`
                                    }
                    });



                    
                    console.dir( response.data ) 


                    if( response.data.status === 'success' )
                    {
                        const sourceAmount = response.data.data.source.amount 
                        const destAmount = response.data.data.destination.amount 
                        const transferRate = response.data.data.rate 
                        const data = { transferRate, amount_from_source_currency: sourceAmount, amount_to_dest_currency: destAmount }
                        return res.status(200).json({ "success": true, data })
                    }

            }
            catch(err)
            {
                logger.error(err)
                return res.status(200).json({"success": false, "msg":" error occured while getting rate "})
            }
        }

module.exports = { verifyDestinationAccount, getTransactionFee, getTransactionRate }
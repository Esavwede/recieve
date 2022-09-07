require('dotenv').config()

// Utils 
const logger = require('../../health/logging/index')
const { serverErrorResponse } = require('../../utils/response/res_500')

// Modules 
const crypto = require('crypto')
const axios = require('axios') 
const flutterwave = require('flutterwave-node-v3')
const flw = new flutterwave( process.env.FLUTTERWAVE_PUBLIC_KEY, process.env.FLUTTERWAVE_SECRET_KEY )


// Models 
const MerchantBalance = require('../../models/MerchantBalance') 
const Transfer = require('../../models/Transfer') 

// Functions 

const saveTransfer = async function(transferDetails)
                    {
                        try 
                        {
                            const newTransfer = new Transfer(transferDetails) 
                            const savedTransfer = await newTransfer.save() 
    
                            if( savedTransfer ){ return { success: true, savedTransfer } }
                          
                        }
                        catch(err)
                        {
                            logger.error(err) 
                            return { success: false, savedTransfer: null } 
                        }
                       
                    }


const runTransfer = async function(transferDetails)
            {
               const res = await flw.Transfer.initiate(transferDetails)
               var msg =  res.complete_message 
               var status = 'success'

                if( status === 'success' )
                {
                    const transfer_id =  'mock_id'
                    const status = 'success'
                    const data = { transfer_id, status, msg } 
                    
                    return { success: true, data}
                }
                
                    msg =  res.message 
                    return { success: false, data:{ msg } }

            }


const getMerchantCanTransfer = function(merchant_balance, transfer_amount )
                {
                    console.log( typeof transfer_amount ) 
                    console.log('here ogagag')
                    if( merchant_balance > transfer_amount )
                    {
                        return true 
                    }
                    else 
                    {
                        return false 
                    }
                }

const getTransferAmount = async function(amount, currency, source_currency)
            {
                
                const amount_in_source_currency = await convertAmountToSourceCurrency(amount, currency, source_currency ) 
                logger.info(` amount to transfer : ${ amount_in_source_currency }`)


                var fee = await getTransferFee(amount_in_source_currency,source_currency)
                logger.info(` transfer fee: ${ fee }`)
                
                 
                // Total Amount To be transfered 
                var  total_amount = fee  + amount_in_source_currency 
                return total_amount 
            }


const getMerchantBalance = async function(merchant_id,source_currency)
            {
                              // check merchant balance 
                              const fields = { wallets: 1, main_balance: 1 } 
                              const merchantBalance = await MerchantBalance.findOne({ merchant_id },fields) 
              
                              // Source Currency Balance 
                              let wallets = merchantBalance.wallets
                              let sourceCurrencyBalance = await getSourceCurrencyBalance(source_currency, wallets) 
                              return sourceCurrencyBalance 
            }


const deductFromMerchantBalance = async function(merchant_id, currency, amount, merchant_balance)
            {
                        try 
                        {

                            merchant_balance = parseFloat(merchant_balance) 

                            const deductAmount = merchant_balance - amount 

                            const arrayFilters = { arrayFilters:[{ "elemX.currency": currency }] }
                            const update = { $set:{ "wallets.$[elemX].balance": deductAmount } } 
                            const balance_updated = await MerchantBalance.updateOne({ merchant_id },update,arrayFilters)
                            
                            logger.info(' Amount deducted from merchant balance ')
                            return balance_updated 
                        }
                        catch(err)
                        {
                            logger.error(err) 
                            return false 
                        }
            }


const generateTransactionReference = function(len)
        {
           const chars = ["a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"]

           let i, randomIndex 
           var ref = [] 


           for( i = 0; i < len; i++ )
           {
                randomIndex = Math.floor( Math.random() * chars.length )
                ref.push( chars[randomIndex ])
           }

           return 'as3rq32_PMCK'
        }


const getSourceCurrencyBalance = async function(source_currency, wallets)
        {
            var i, sourceCurrencyBalance 

            for( i = 0; i < wallets.length; i++ )
            {
                if( wallets[i].currency === source_currency )
                {
                    sourceCurrencyBalance = wallets[i].balance 
                    return sourceCurrencyBalance
                }
            }
                    return false 
        }


const getTransferFee = async function(amount, currency)
            {
               const res =  await  flw.Transfer.fee(
                {
                    type:'account',
                    amount, 
                    currency,
                })

                const fee = res.data[0].fee 
                  return fee 
            }


const convertAmountToSourceCurrency = async function(amount,currency,source_currency)
            {
              const res =  await axios.get(`https://api.flutterwave.com/v3/transfers/rates?amount=${amount}&destination_currency=${currency}&source_currency=${source_currency}`, 
                {
                       headers: {
                                 'Authorization': `Bearer ${ process.env.FLUTTERWAVE_SECRET_KEY }`
                                }
                });

                const source_amount = res.data.data.source.amount 
                return source_amount
            }




// Middlewares 

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
                return res.status(500).json({"success": false, "msg":" error occured while getting rate "})
            }
        }


const transfer = async function(req, res, next)
        {
            try 
            {

                const { source_currency, account_bank, account_number, amount, narration, currency } = req.body 
           
                const merchant_id = '62cb40005db61fb61b246905' 

                
               

                // Validate Account Details Schema 
                const transferDetails = 
                {
                    account_bank,
                    account_number,
                    amount,
                    narration,
                    currency,
                    reference: 'merchantreg0293039_PMCK',
                    debit_currency: "NGN"
                }


                logger.info(' Transfer Details Created ')

                console.log( transferDetails.reference ) 

                const total_amount = await getTransferAmount(amount, currency, source_currency)
                logger.info(` total amount : ${ total_amount }`)


                const currentTranferDetails = {  source_currency, source_amount: total_amount.toString(), account_bank, account_number, amount, narration, currency}


                const merchant_balance = await getMerchantBalance(merchant_id,source_currency) 
                logger.info(` merchant_balance :${ merchant_balance }`)


                if( !merchant_balance ){ return res.status(200).json({ "success": false, "msg":" balance not found "})}


                const merchantCanTransfer = getMerchantCanTransfer(merchant_balance, total_amount)

         
                switch( merchantCanTransfer )
                {
                    case true:
                                logger.info(` merchant balance : ${ merchant_balance }, is more than transfer amount: ${ total_amount }`)
                                const transferResult = await runTransfer(transferDetails)

                                const transferInitiated = transferResult.success 
                                const msg = transferResult.data.msg 

                                if( !transferInitiated )
                                {
                                    logger.info(' transfer failed ' + msg)
                                    return res.status(200).json({ success: false, msg:`transfer failed : ${msg}`})
                                }
                                else 
                                {
                                    // check status 
                                    var mock_transfer_status = 'SUCCESSFUL' 
                                    const transferStatus = mock_transfer_status || transferResult.data.status

                                    console.log(` Transfer Status : ${ transferStatus }`)
                                    

                                    switch(transferStatus)
                                    {
                                        case 'FAILED':
                                                        logger.info(' Transfer failed ') 
                                                        return res.status(200).json({ success: false, msg:` transfer failed: ${ msg }`})


                                        case 'NEW': 
                                                        logger.info(' Transfer created ')
                                                        currentTranferDetails.status = 'NEW'

                                                        const transferDetailsCreated = await saveTransfer(currentTranferDetails)
                                                        // track transaction

                                                        if( transferDetailsCreated.success )
                                                        {
                                                            return res.status(200).json({ success: true, msg:" new transfer created"})
                                                        }
                                                            return res.status(200).json({ success: false, msg:"error occured while saving new transfer details "})
                                                        
                                                      

                                        case 'PENDING':
                                                        logger.info(' Transfer is being processed ')
                                                        currentTranferDetails.status = 'PENDING'

                                                        const pending_transferDetailsCreated = await saveTransfer(currentTranferDetails)
                                                        // track transaction

                                                        if( pending_transferDetailsCreated.success )
                                                        {
                                                            return res.status(200).json({ success: true, msg:" new transfer is processing "})
                                                        }
                                                            return res.status(200).json({ success: false, msg:"error occured while saving new transfer details "})
                                                    

                                        case 'SUCCESSFUL':
                                                        logger.info(' Transfer successful ')
                                                        currentTranferDetails.status = 'SUCCESSFUL'
                                                        
                                                        const success_transferDetailsCreated = await saveTransfer(currentTranferDetails)
                                                        // track transaction

                                                        if( success_transferDetailsCreated.success )
                                                        {
                                                            res.status(200).json({ success: true, msg:" transfer complete "})
                                                        }
                                                        else 
                                                        {
                                                            res.status(200).json({ success: false, msg:"error occured while saving new transfer details "})
                                                        }
                                                           
                                                        // deduct from balance 
                                                        
                                                       const balanceUpdated =  await deductFromMerchantBalance(merchant_id, source_currency, total_amount, merchant_balance)
                                                       if( balanceUpdated )
                                                       {
                                                            logger.info(' Balance Updated successfully ')
                                                       } 
                                                       return 

                                        default:
                                                        logger.info(' Unknown Transfer Status ')
                                                        logger.info(` Transfer Status : ${ transferStatus }`)
                                    }
                                    
                                }

                                return res.status(200).json({ success: true, msg:" balance sufficient" })

                    default:
                                logger.info(` transfer amount: ${ total_amount }, is more that merchant balance ${ merchant_balance }`)
                                return res.status(200).json({ success: false, msg:" insufficient balance" })
                }



            }
            catch(err)
            {
                logger.error(err)
                return serverErrorResponse(' Server encountered error during transfer  ',res) 
            }
        }



module.exports = { verifyDestinationAccount, getTransactionFee, getTransactionRate, transfer }



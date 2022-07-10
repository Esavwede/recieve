const mongoose = require('mongoose')
const Schema = mongoose.Schema 



const WalletSchema = new Schema 
        (
            {
                currency:
                {
                    type: String, 
                    trim: true, 
                    required: true,
                    default:"NGN"
                },
                balance: 
                {
                    type: String, 
                    required: true,
                    default: '0.0' 
                }
            }
        )



const MerchantBalanceSchema = new Schema 
    (
        {

            merchant_id:
            {
                type: mongoose.Types.ObjectId,
                required: true 
            },
            main_currency:
            {
                type: String, 
                required: true, 
                default: "NGN" 
            },
             main_balance:
            {
                type: String, 
                required: true, 
                default: '0.0'
            },
            wallets:
            {
                type: [WalletSchema],
                required: true, 
                default: [{ currency: "NGN", balance: '0.0' }]
            }
        }
    )

    


    const MerchantBalance = mongoose.model('merchant_balance',MerchantBalanceSchema)

    module.exports = MerchantBalance
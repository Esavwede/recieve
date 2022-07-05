const express = require('express')
const router = express.Router() 


const transfer = require('../controllers/Transfer/transfer')


module.exports = (app)=> {

    router.post('/resolve/accountDetails', transfer.verifyDestinationAccount )
    router.post('/transactionFee', transfer.getTransactionFee ) 
    router.post('/transactionRate', transfer.getTransactionRate ) 

    app.use('/api/v1/transfer',router)
}

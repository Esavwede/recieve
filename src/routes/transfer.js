const express = require('express')
const router = express.Router() 


const transfer = require('../controllers/Transfer/transfer')


module.exports = (app)=> {

    router.post('/', transfer.transfer ) 
    router.post('/accountDetails', transfer.verifyDestinationAccount )
    router.post('/fee', transfer.getTransactionFee ) 
    router.post('/rate', transfer.getTransactionRate ) 

    app.use('/api/v1/transfer',router)
}

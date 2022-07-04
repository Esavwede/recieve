const express = require('express')
const router = express.Router() 


const transfer = require('../controllers/Transfer/transfer')


module.exports = (app)=> {


    router.post('/resolve/accountDetails', transfer.verifyDestinationAccount )

    app.use('/api/v1/transfer',router)
}
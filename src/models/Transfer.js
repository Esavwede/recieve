const Transfers = require('flutterwave-node-v3/lib/rave.transfers')
const mongoose = require('mongoose')
const Schema = mongoose.Schema 


const TransferSchema = new Schema 
    (
        {
            source_currency:
            {
                type: String, 
                required: true, 
                trim: true
            },
            source_amount:
            {
                type: String,
                required: true, 
                trim: true 
            },
            currency:
            {
                type: String, 
                required: true, 
                trim: true
            },
            amount: 
            {
                type: String, 
                required: true, 
                trim: true
            },
             account_bank:
            {
                type: String, 
                required: true, 
                trim: true
            },
            account_number:
            {
                type: String, 
                required: true, 
                trim: true
            },
            status:
            {
                type: String, 
                required: true
            },
            narration:
            {
                type: String, 
                required: true 
            },
            createdOn:
            {
                type: Date, 
                required: true, 
                default: Date.now 
            }
        }
    )



    const Transfer = mongoose.model('transfer',TransferSchema)

    module.exports = Transfer 
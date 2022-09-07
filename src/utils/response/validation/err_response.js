const reqBodyErr = function(msg,res)
            {
                res.status(422).json({ success: false, msg })
            }



module.exports = { reqBodyErr } 


const serverErrorResponse = function(message,res)
                            {
                                return res.status(500).json({ "sucess": false, "msg": message })
                            }


module.exports = { serverErrorResponse } 
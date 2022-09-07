const User = require('../../../models/User')
const  { comparePassword } = require('../../functions/password.function')
const logger = require('../../../health/logging/index')
const jwt = require('jsonwebtoken')
require('dotenv').config() 


const checkUserExists = async function(email)
                {
                        const userExists = await User.findOne({email},{ email: 1, _id: 0})
                        return userExists
                }



const authenticateUser = async function(email,password)
                {
                      try 
                      {


                        const returnFields = { _id: 1, email: 1, password: 1, firstname: 1, lastname: 1, emailVerified: 1 }

                        logger.info(' Getting user details from database ') 
                        const user = await User.findOne({ email },returnFields)
                        
        
                         if( !user ) // User Email Not Correct 
                         { 
                              logger.info(' Email incorrect ')
                              return { success: false, "msg":"check email and try again", statusCode: 400 } 
                         }


                         const passwordIsValid = await comparePassword(password,user.password) 

                         
                         if( !passwordIsValid ) // User password not correct 
                         {   
                              logger.info(' Password incorrect ')
                              return { success: false, "msg":"check password and try again", statusCode: 400 } 
                         }



                         logger.info(' Valid User details ')
                         // Sign and return user details 
                         var { firstname, lastname, email, emailVerified, _id } = user  
                         const accessToken = await jwt.sign({ firstname, lastname, email, emailVerified, _id },process.env.SIGNIN_ACCESS_TOKEN_SECRET,{ expiresIn:'3d'})
                         
                         const accessTokenKey = store.count + 1 
                         store[`${accessTokenKey}`] = accessToken 
                         
                         console.log( store ) 
                         
                         const userData = { accessTokenKey, firstname, lastname, email, emailVerified, _id } 
                         return { success: true, "msg":"user successfully authorized", statusCode: 200, userData }

                      }
                      catch(err)
                      {
                                logger.error(err) 
                                return err 
                      }
                }




module.exports = { checkUserExists, authenticateUser }
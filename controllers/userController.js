const User = require('../model/userModel')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
require('dotenv').config()

const otpModel = require('../model/userOtp') //otp model
const userOtp = require('../model/userOtp')
const category = require('../model/categoryModel')
const productModel = require('../model/productModel')

const loadHome = async(req,res)=>{
    try {
        res.render('index')
    } catch (error) {
        console.log(error.message)
    }
}

const loadShop = async(req,res)=>{
    try {
        const products = await productModel.find()
        const categoryModel = await category.find()
        res.render('shop',{categoryModel,products})
    } catch (error) {
        console.log(error.message)
    }
}


// const loadChairs = async(req,res)=>{
//     try {
//         res.render('chairs')
//     } catch (error) {
//         console.log(error.message)
//     }
// }


const loadAbout = async(req,res)=>{
    try {
        res.render('about')
    } catch (error) {
        console.log(error.message)
    }
}

const loadServices = async(req,res)=>{
    try {
        res.render('services')
    } catch (error) {
        console.log(error.message)
    }
}

const loadBlog = async(req,res)=>{
    try {
        res.render('blog')
    } catch (error) {
        console.log(error.message)
    }
}

const loadContact = async(req,res)=>{
    try {
        res.render('contact')
    } catch (error) {
        console.log(error.message)
    }
}

const loadCart = async(req,res)=>{
    try {
        res.render('cart')
    } catch (error) {
        console.log(error.message)
    }
}

//user login

const loadLogin = async(req,res)=>{
    try {
        res.render('login')
    } catch (error) {
        console.log(error.message)
    }
}


const loadForgotPass = async(req,res)=>{
    try {
        res.render('forgotpass')
    } catch (error) {
        console.log(error.message)
    }
}

const newPass = async(req,res)=>{
    try {
        const email = req.body.email
        const data = await User.findOne({email:email,isVerified:1})
        if(data){
            await sentOtp(data,res)
        }else{
            res.render('forgotpass',{message:`Account doesn't exist!`})
        }
        
        
    } catch (error) {
        console.log(error.message)
    }
}



const verifyUser = async(req,res)=>{
    try {
        const email = req.body.email
        const password = req.body.password

        const userData = await User.findOne({email:email})
        if(userData){
            
            const passwordMatch = await bcrypt.compare(password,userData.password)
            if(passwordMatch){
                const isVerified = await User.findOne({email:email,isVerified:0})
                if(isVerified){
                    res.render('login',{message:'User not verified!'})
                }else{
                req.session.user_id = userData._id
                res.redirect('/')
                }
            }else{
                res.render('login',{message:'invalid credentials!'})
            }
        }else{
            res.render('login',{message:'invalid credentials!'})
        }
    } catch (error) {
        console.log(error.message)
    }
}


const loadUserProf = async(req,res)=>{
    try {
        const user = await User.find()
        res.render('userprofile',{user})
    } catch (error) {
        console.log(error.message)
    }
}


//user reg


const loadRegister = async(req,res)=>{
    try {
        res.render('register')
    } catch (error) {
        console.log(error.message)
    }
}


//password hash

const securePassword = async(password)=>{
    try {
        const hashPassword = await bcrypt.hash(password,10)
        return hashPassword
    } catch (error) {
        console.log(error)
    }

}

//user registration

const insertUser = async(req,res)=>{
    try {
        const {email} = req.body
    const existUser = await User.findOne({email:email,isVerified:1})
    if(existUser){
        res.render('register',{message:'Already have an account with this email!'})
    }else{
        const spassword = await securePassword(req.body.password)
        const user = new User({
            username:req.body.username,
            email:req.body.email,
            mobile:req.body.mobile,
            password:spassword,
            isVerified:0,
            isBlocked:false
        })
        const userData = await user.save().then((result)=>{
            sentOtp(result,res),
            resendOtp(result,res)
        })
        
    }
    
    } catch (error) {
        console.log(error)
    }
}



// const insertUser = async(req,res)=>{
//     try {
//     const otp = await req.body.otpv
//     const response = await otpModel.find({otp}).sort({createdAt:-1}).limit(1)
//     if(response.length === 0 || otp !== response[0].otp){
//         return res.render('otpVerify',{message:'OTP is not valid'})
//     }
//     const spassword = await securePassword(req.body.password)
//     const user = new User({
//              username:req.body.username,
//              email:req.body.email,
//              mobile:req.body.mobile,
//              password:spassword,
//              isVerified:0
//     })
//     const userData = await user.save()
//     if(userData){
//         res.render('index')
//         }else{
//         res.render('register',{message:'registration failed!'})
//         }
// } catch (error) {
//     console.log(error)
// }
// }



//otp 

const sentOtp = async({email},res)=>{
    try {
        
        const genOtp = Math.floor(100000 + Math.random()*9000)
        console.log(email)
        console.log(genOtp)
        //nodemailer
        const transporter = nodemailer.createTransport({
            service:'gmail',
            host:'smtp.gmail.com',
            port:587,
            secure:true,
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.Mail_PASS
            }
        })

        const mailOptions = {
            from:process.env.MAIL_USER,
            to:email,
            subject:'Verify your email',
            html:`<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
            <html xmlns="http://www.w3.org/1999/xhtml">
            
            <head>
              <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify your login</title>
              <!--[if mso]><style type="text/css">body, table, td, a { font-family: Arial, Helvetica, sans-serif !important; }</style><![endif]-->
            </head>
            
            <body style="font-family: Helvetica, Arial, sans-serif; margin: 0px; padding: 0px; background-color: #ffffff;">
              <table role="presentation"
                style="width: 100%; border-collapse: collapse; border: 0px; border-spacing: 0px; font-family: Arial, Helvetica, sans-serif; background-color: rgb(239, 239, 239);">
                <tbody>
                  <tr>
                    <td align="center" style="padding: 1rem 2rem; vertical-align: top; width: 100%;">
                      <table role="presentation" style="max-width: 600px; border-collapse: collapse; border: 0px; border-spacing: 0px; text-align: left;">
                        <tbody>
                          <tr>
                            <td style="padding: 40px 0px 0px;">
                             
                              <div style="padding: 20px; background-color: rgb(255, 255, 255);">
                                <div style="color: rgb(0, 0, 0); text-align: left;">
                                  <h1 style="margin: 1rem 0">Verification code</h1>
                                  <p style="padding-bottom: 16px">Please use the verification code below to sign in.</p>
                                  <p style="padding-bottom: 16px"><strong style="font-size: 130%">${genOtp}</strong></p>
                                  <p style="padding-bottom: 16px">If you didn’t request this, you can ignore this email.</p>
                                  <p style="padding-bottom: 16px">Thanks,<br>Apollo Furniture</p>
                                </div>
                              </div>
                              <div style="padding-top: 20px; color: rgb(153, 153, 153); text-align: center;">
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </body>
            
            </html>`
        }

        const filter = {email:email}
        const update = {
            email:email,
            otp:genOtp,
            createdDate:Date.now(),
            expiresAt:Date.now()+12000

        }

        const result = await otpModel.findOneAndUpdate(filter,update,{
            upsert:true,
            new:true
        })


        await transporter.sendMail(mailOptions)
            
        if(result){
            res.render('otpVerify',{email})
            
        }else{
            res.render('register',{message:'registration failed!'})
        }
        
    } catch (error) {
        console.log(error.message)
    }
        
}


const resendOtp = async(req,res)=>{
    try {
        const email = req.query.email
        const user = await User.findOne({ email: email });
        await sentOtp(user,res)
    } catch (error) {
        console.log(error.message)
    }
}

//otpvalidation
const otpValidate = async(req,res)=>{
    try {
        
        const {otpv,email} = req.body
        
        console.log(otpv)
        const otpData = await otpModel.findOne({otp:otpv})

        if(otpData){
            const userData = await User.findOneAndUpdate({email:email},{$set:{isVerified:1}})
            res.render('index',{message:'Registration Successful!'})
        }else{
            res.render('otpVerify',{message:'Invalid OTP!'})
        }
    } catch (error) {
        console.log(error.message)
    }
}


const loadCheckout = async(req,res)=>{
    try {
        res.render('checkout')
    } catch (error) {
        console.log(error.message)
    }
}

const loadThankYou = async(req,res)=>{
    try {
        res.render('thankyou')
    } catch (error) {
        console.log(error.message)
    }
}

const logout = async(req,res)=>{
    try {
        req.session.user_id = null
        res.redirect('/')
    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadHome,
    loadShop,
    loadAbout,
    loadServices,
    loadBlog,
    loadContact,
    loadCart,
    loadLogin,
    loadRegister,
    loadCheckout,
    loadThankYou,
    insertUser,
    verifyUser,
    loadUserProf,
    logout,
    sentOtp,
    otpValidate,
    // loadChairs
    resendOtp,
    loadForgotPass,
    newPass
    
}
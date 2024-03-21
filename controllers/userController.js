const User = require('../model/userModel')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
require('dotenv').config()

const otpModel = require('../model/userOtp') //otp model
const userOtp = require('../model/userOtp')
const category = require('../model/categoryModel')
const productModel = require('../model/productModel')
const cartModel = require('../model/cartModel')
const orderModel = require('../model/orderModel')
const offerModel = require('../model/offerModel')
const randomString = require('randomstring')


const loadHome = async(req,res)=>{
    try {

        const products = await productModel.find()
        res.render('index',{products})
    } catch (error) {
        console.log(error.message)
    }
}

const loadShop = async(req,res)=>{
    try {
        const categoryName = req.query.category
        const priceRange = req.query.price
        const categoryModel = await category.find()
        if(priceRange!==undefined){
            if(priceRange!=='select'){
                const [minPrice, maxPrice] = priceRange.split("-");
             const productPrice = await productModel.find({price:{$gte:minPrice,$lte:maxPrice}}).populate('offer').populate({path:'categoryId',populate:{path:'offer',model:'offerModel'}})
             res.json({successPrice:true,categoryModel,products:productPrice})
            }else{
                const products = await productModel.find().populate('offer').populate({path:'categoryId',populate:{path:'offer',model:'offerModel'}})
                res.json({allSuccessPrice:true,categoryModel,products})
            }
            
        
        }
       
        
        const products = await productModel.find().populate('offer').populate({path:'categoryId',populate:{path:'offer',model:'offerModel'}})
        const productCategory = await productModel.find({category:categoryName}).populate('offer').populate({path:'categoryId',populate:{path:'offer',model:'offerModel'}})

       
        

        
        if(categoryName===undefined ){
            res.render('shop',{categoryModel,products})
        }else if(categoryName==='all'){
            res.json({allSuccess:true,categoryModel,products})
        }else{
            res.json({success:true,categoryModel,products:productCategory})
        }
        

        //price filter

        // if(priceRange===undefined){
        //     res.render('shop',{categoryModel,products})
        // }else if(priceRange==='select'){
        //     res.json({allSuccessPrice:true,categoryModel,products})
        // }else{
        //     res.json({priceSuccess:true,categoryModel,products:productCategory})
        // }
        
    } catch (error) {
        console.log(error.message)
    }
}


const searchItems = async(req,res)=>{
    try {
        const value = req.query.value
        const products = await productModel.find({$or:[{name:{$regex:value,$options:'i'}},{description:{$regex:value,$options:'i'}}]}).populate('offer')
        const categoryModel = await category.find()

        if(products.length>0){
            res.json({success:true,products})
        }else{
            res.json({success:false})
        }
        
        
        
    } catch (error) {
        console.log(error.message)
    }
}



const loadProductDetails = async(req,res)=>{
    try {
        const id = req.query.id
        const products = await productModel.findOne({_id:id}).populate('offer').populate({path:'categoryId',populate:{path:'offer',model:'offerModel'}})
        res.render('productDetails',{products})
    } catch (error) {
        console.log(error.message)
    }
}



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
            const randomStr = randomString.generate()
            const updatedToken = await User.updateOne({email:email},{$set:{token:randomStr}})
            sentResetLink(email,randomStr)
            res.render('forgotpass',{message:'Please check your mail'})
        }else{
            res.render('forgotpass',{message:`Account doesn't exist!`})
        }
        
        
    } catch (error) {
        console.log(error.message)
    }
}



const loadResetPass = async(req,res)=>{
    try {
        const token = req.query.token
        const userToken = await User.findOne({token:token})
        if(userToken){
            res.render('newPass',{user_id:userToken._id})
        }else{
            res.render('404',{message:'token is invalid'})
        }
        
    } catch (error) {
        console.log(error)
    }
}


const passwordReset = async(req,res)=>{
    try {
        
        const user_id = req.body.user_id
        const newPass = req.body.password
        const confirmPass = req.body.confirmPassword
        if(newPass===confirmPass){
           const securePass =  await securePassword(confirmPass)
            const updatedPass = await User.findByIdAndUpdate({_id:user_id},{$set:{password:securePass,token:''}})
            if(updatedPass){
                res.redirect('/login')
            }else{
                res.render('newPass',{message:'something gone wrong'})
            }
           
        }else{
            res.render('newPass',{message:'Password not match!'})
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
            const status = await User.findOne({isBlocked:true})
            const passwordMatch = await bcrypt.compare(password,userData.password)
            if(passwordMatch){
                const isVerified = await User.findOne({email:email,isVerified:0})
                if(isVerified){
                    res.render('login',{message:'User not verified!'})
                }else if(status){
                    res.render('login',{message:'Access Denied!'})
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
        const userid = req.session.user_id
        const user = await User.findOne({_id:userid})
        const orderData = await orderModel.find({userId:userid}).populate({
            path: 'items.product_id',
            populate: [
                { path: 'offer', model: 'offerModel' },
                { path: 'categoryId', model: 'categoryModel',populate:{path:'offer',model:'offerModel'}}
            ]
        });
        
        if(userid){
            res.render('userprofile',{user,orderData})

        }else{
            res.redirect('/login')
        }
        
    } catch (error) {
        console.log(error.message)
    }
}


const postChangePass = async(req,res)=>{
    try {
        const currPass = req.body.currentpass
        const newPass = req.body.password
        const cnfmPass = req.body.cpassword
        const userid = req.session.user_id
        const userData = await User.findOne({_id:userid})
        const orderData = await orderModel.find({userId:userid}).populate({path:'items.product_id'})
        if(userData){
        const passwordMatch = await bcrypt.compare(currPass,userData.password)
        if(passwordMatch){
                if(newPass===cnfmPass){
                    const spassword = await securePassword(cnfmPass)
                     
                    await User.findByIdAndUpdate({_id:userid},{password:spassword})
                    // res.render('userprofile',{message:'password changed successfully!',user:userData})
                    res.json({success:true})
                    
                }else{
                    // res.render('userprofile',{message:'password not match!',user:userData})
                    res.json({success:false})
                }
        }else{
            
            res.render('userprofile',{message:'current password is wrong',user:userData,orderData:orderData})
        }
    }
    } catch (error) {
        console.log(error.message)
    }
}


const postChangeDetails = async(req,res)=>{
    try {
        const userid = req.session.user_id
        const user = await User.findOne({_id:userid})
        const name = req.body.username
        const mobile = req.body.mobile
        const email = req.body.email 
        const userData = await User.findOneAndUpdate({_id:userid},{username:name,mobile:mobile,email:email})
        if(userData){
            res.json({success:true})
        }else{
            console.log('error');
            res.json({success:false})
        }
        
    } catch (error) {
        console.log(error.message)
    }
}



//adding address



const postAddAddress = async(req,res)=>{
    try {
        const userid = req.session.user_id
        const {username,email,mobile,address,pincode,state,city} = req.body
        const userData = await User.findOneAndUpdate({_id:userid},{$push:{address:{name:username,localAddress:address,city:city,state:state,phone:mobile,email:email,pincode:pincode}}})
        if(userData){
            res.json({success:true})
        }else{
            res.json({success:false})
        }
        
        
    } catch (error) {
        console.log(error.message)
    }
}

//edit address

const postEditAddress = async(req,res)=>{
    try {
        const userid = req.session.user_id
        const addressId= req.body.addrid
        const {username,email,mobile,address,pincode,state,city} = req.body
       
        const userData = await User.findOneAndUpdate({_id:userid,'address._id':addressId},
        {$set:{'address.$.name':username,'address.$.localAddress':address,
        'address.$.city':city,'address.$.state':state,
        'address.$.phone':mobile,'address.$.email':email,
        'address.$.pincode':pincode}},{new:true})
    
       
        if(userData){
            res.json({success:true})
        }else{
            res.json({success:false})
        }
        
        
    } catch (error) {
        console.log(error.message)
    }
}


//delete address


const deleteAddress = async(req,res)=>{
    try {
        const userid = req.session.user_id
        const addressId = req.query.id
        const userData = await User.findOneAndUpdate({_id:userid},{$pull:{address:{_id:addressId}}})
        if(userData){
            res.json({success:true})
        }else{
            res.json({success:false})
        }
        
        
    } catch (error) {
        console.log(error.message)
    }
}


const addressDetails = async(req,res)=>{
    try {
        
        const userid = req.session.user_id
        const addressId = req.body.addressId
        const userAddress = await User.findOne({_id:userid,'address._id':addressId})

        const addressIndex = userAddress.address.find(address => address._id.equals(addressId));
        
        if(addressIndex){
            res.json({success:true,addressIndex:addressIndex})
        }else{
            res.json({success:false})
        }
        
        
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
    const referralCode = randomString.generate(7)
    const referralInput = req.body.referral
    const validReferral = await User.findOne({referralCode:referralInput})
    let wallet = 0
    if(existUser){
        res.render('register',{message:'Already have an account with this email!'})
    }else{
        if(validReferral){
            wallet = 50
            await User.findOneAndUpdate({referralCode:referralInput},{$inc:{wallet:100}})
        }
        const spassword = await securePassword(req.body.password)
        const user = new User({
            username:req.body.username,
            email:req.body.email,
            mobile:req.body.mobile,
            password:spassword,
            isVerified:0,
            isBlocked:false,
            referralCode:referralCode,
            wallet:wallet
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
			host: "smtp.gmail.com",
			port: 587,
			secure: false,
			requireTLS: true,
			auth: {
				user: "sudarshwazza382@gmail.com",
				pass: "omkm jhhx vdqi dcpo"
			},
		  });

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



//reset link email


const sentResetLink = async(email,token,res)=>{
    try {
        const transporter = nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:process.env.MAIL_USER,
                pass:process.env.MAIL_PASS
            }
        })

        const mailOptions = {
            from:process.env.MAIL_USER,
            to:email,
            subject:'Password Reset Link',
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
                                  <h1 style="margin: 1rem 0">Reset Link</h1>
                                  <p style="padding-bottom: 16px">Please click the reset link to reset password.</p>
                                  <p style="padding-bottom: 16px"><strong style="font-size: 130%"><a href="http://localhost:3000/newPass?token=${token}">Reset Link</a></strong></p>
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



        await transporter.sendMail(mailOptions,(error,info)=>{
            if(error){
                console.log(error)
            }else{
                console.log('email has been sent = ',info.response)
            }
        })
            
        
        
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
        
        const otpData = await otpModel.findOne({otp:otpv})

        if(otpData){
            const userData = await User.findOneAndUpdate({email:email},{$set:{isVerified:1}})
            // res.render('index',{message:'Registration Successful!'})
            res.redirect('/')
        }else{
            res.render('otpVerify',{message:'Invalid OTP!'})
        }
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
    loadLogin,
    loadRegister,
    loadThankYou,
    insertUser,
    verifyUser,
    loadUserProf,
    logout,
    sentOtp,
    otpValidate,
    resendOtp,
    loadForgotPass,
    newPass,
    loadProductDetails,
    postChangePass,
    postChangeDetails,
    postAddAddress,
    deleteAddress,
    sentResetLink,
    passwordReset,
    loadResetPass,
    addressDetails,
    postEditAddress,
    searchItems
    
}
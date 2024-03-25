const categoryModel = require("../model/categoryModel")
const productModel = require("../model/productModel")
const userModel = require('../model/userModel')
const orderModel = require('../model/orderModel')
const multer = require('multer')
const sharp = require('sharp')
const offerModel = require("../model/offerModel")
require('dotenv').config()


const storage = multer.memoryStorage()
const uploads = multer({storage:storage}).array('image',5)




const loadLogin = async(req,res)=>{
    try {
        res.redirect('/admin/dashboard')
    } catch (error) {
        console.log(error.message)
    }
}




const verifyAdmin = async(req,res)=>{
    try {
        const {email,password} = req.body
        if(email===process.env.admMail&&password===process.env.admPass){
            req.session.admin_id = email
            res.redirect('/admin/dashboard')
        }else{
            res.render('login',{message:'invalid credentials'})
        }
    } catch (error) {
        console.log(error.message)
    }
}

const loadDashboard = async(req,res)=>{
    try {
        const order = await orderModel.find().populate('userId').populate('items.product_id').sort({createdAt:-1})
        const product = await productModel.find()
        const category = await categoryModel.find()

        const topSellingProducts = await orderModel.aggregate([
           
            { $match: { "items.status": "delivered" } },
            { $unwind: '$items' },
            
            {
                $group: {
                    _id: "$items.product_id",
                    totalQuantitySold: { $sum: "$items.quantity" }
                }
            },
            
            { $sort: { totalQuantitySold: -1 } },
            
            { $limit: 10 },

            {
                $lookup: {
                    from: "productmodels", 
                    localField: "_id",
                    foreignField: "_id",
                    as: "product"
                }
            },
            
            { $unwind: "$product" },
            
            {
                $project: {
                    _id: 0,
                    productName: "$product.name", 
                    productImage:"$product.images",
                    productBrand:"$product.brand",
                    totalQuantitySold: 1
                }
            }
        ])



        //top selling brands


        const topSellingBrands = await orderModel.aggregate([
           
            { $match: { "items.status": "delivered" } },
            { $unwind: '$items' },
            
            {
                $group: {
                    _id: "$items.product_id",
                    totalQuantitySold: { $sum: "$items.quantity" }
                }
            },
            
            { $sort: { totalQuantitySold: -1 } },
            
            { $limit: 10 },

            {
                $lookup: {
                    from: "productmodels", 
                    localField: "_id",
                    foreignField: "_id",
                    as: "product"
                }
            },
            
            { $unwind: "$product" },

        
            
            {
                $project: {
                    _id: 0,
                    productBrand: "$product.brand", 
                    productImage:"$product.images",
                    totalQuantitySold: 1
                }
            },

            {
                $group:{
                    _id:'$productBrand',
                    count:{$sum:1}
                }
            },
            { $sort: { count: -1 , _id: 1 } }
        ])



        res.render('adminDashboard',{order,product,category,topSellingProducts,topSellingBrands})
    } catch (error) {
        console.log(error.message)
    }
}

const loadProductList = async(req,res)=>{
    try {

        const limit = 6
        const queryPage = parseInt(req.query.page) || 1
        const skip = (queryPage - 1) * limit

        const totalProducts = await productModel.countDocuments()
        const totalPage = Math.ceil(totalProducts/limit)
        


        const offer = await offerModel.find()
        const category = await categoryModel.find()
        const products = await productModel.find().sort({createdAt:-1,_id:1}).skip(skip).limit(limit);

        res.render('productList',{category,products,offer,totalPage})
    } catch (error) {
        console.log(error.message)
    }
}

const loadCategory = async(req,res)=>{
    try {

        const limit = 4
        const queryPage = parseInt(req.query.page) || 1
        const skip = (queryPage - 1) * limit

        const totalCategory = await categoryModel.countDocuments()
        const totalPage = Math.ceil(totalCategory/limit)

        const offer = await offerModel.find()
        const category = await categoryModel.find().sort({_id:1}).skip(skip).limit(limit);
        res.render('category',{category,offer,totalPage})
    } catch (error) {
        console.log(error.message)
    }
}

const loadOrders = async(req,res)=>{
    try {

        const limit = 6
        const queryPage = parseInt(req.query.page) || 1
        const skip = (queryPage - 1) * limit

        const totalOrders = await orderModel.countDocuments()
        const totalPage = Math.ceil(totalOrders/limit)

        const order = await orderModel.find().populate('userId').populate({
            path: 'items.product_id',
            populate: [
                { path: 'offer', model: 'offerModel' },
                { path: 'categoryId', model: 'categoryModel',populate:{path:'offer',model:'offerModel'}}
            ]
        }).sort({createdAt:-1,_id:1}).skip(skip).limit(limit);
        
          
            res.render('orders',{order,totalPage})
          
        
    } catch (error) {
        console.log(error.message)
    }
}

const loadSalesReport = async(req,res)=>{
    try {
        const startDate = req.query.sd
        const endDate = req.query.ed
        if(startDate!==undefined && endDate!==undefined){
            const startDateShort = new Date(startDate)
        const endDateShort = new Date(endDate)
       const start =  startDateShort.toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
        .replace(/\//g, '-');
        const end =  endDateShort.toLocaleString('en-US', { year: 'numeric', month: 'short', day: '2-digit' })
        .replace(/\//g, '-');
        const orderDateFilter = await orderModel.find({date:{$gte:start,$lte:end}}).populate('userId').populate({
            path: 'items.product_id',
            populate: [
                { path: 'offer', model: 'offerModel' },
                { path: 'categoryId', model: 'categoryModel',populate:{path:'offer',model:'offerModel'}}
            ]
        });
        if(orderDateFilter){
            res.json({orderFilter:true,order:orderDateFilter})
        }else{
            res.json({orderFilter:false})
        }
        
        
        }
        const users = await userModel.find()
        const order = await orderModel.find().populate('userId').populate('items.product_id')
        
        
          
        res.render('salesReport',{order})
    } catch (error) {
        console.log(error.message)
    }
}



const loadEditCategory = async(req,res)=>{
    try {
        const id = req.query.id
        const ctg = await categoryModel.findOne({_id:id})
        if(!ctg){
            res.render('category',{message:'data not found'})
        }else{
            res.render('editCategory',{ctg})
        }
        
    } catch (error) {
        console.log(error.message)
    }
}


const postEditCategory = async(req,res)=>{
   try {
    const existCategory = await categoryModel.findOne({name:req.body.categoryName})
    if(!existCategory){
        const ctgEdit = await categoryModel.findByIdAndUpdate({ _id: req.body.id }, 
            { name: req.body.categoryName, description: req.body.description })
        if(ctgEdit){
            res.json({success:true})
        }else{
            res.json({success:false})
        }
    }else{
        res.json({existCategory:true,message:'Category is already existing'})
    }
    

    
   } catch (error) {
    console.log(error.message)
   }
    
}


const postCategory = async(req,res)=>{
    try {
        const{name,description} = req.body
        const category = await categoryModel.findOne({name:name})
        if (!name || !description) {
            res.json({success:false})
          }else if(category){
            res.json({existCategory:true,message:'The category is already exists!'})
          }
          
          
          else{
            const ctg = new categoryModel({
                name: name,
                description: description,
                is_Listed: true
        
              })

              let ctgData = await ctg.save()
              
              if(ctgData){
                res.json({success:true})
                
              }
          }

    } catch (error) {
        console.log(error.message)
    }
}


const deleteCategory = async(req,res)=>{
    try {
        const id = req.query.id
        const dltctg = await categoryModel.findByIdAndDelete({_id:id})
        if(dltctg){
            res.redirect('/admin/category')
        }else{
            res.render('category',{message:'data not found!'})
        }
        
    } catch (error) {
        console.log(error.message);
    }
}

const loadUsers = async(req,res)=>{
    try {
        const users = await userModel.find()
        res.render('users',{users})
    } catch (error) {
        console.log(error.message)
    }
}

const loadAddProducts = async(req,res)=>{
    try {
        const category = await categoryModel.find()
        res.render('addProduct',{category})
    } catch (error) {
        console.log(error.message)
    }
}


const unListProducts = async(req,res)=>{
    try {
        const productId = req.query.id
        const unListProduct = await productModel.findOneAndUpdate({_id:productId},{$set:{isListed:false}})
        
        if(unListProduct){
            res.redirect('/admin/productList')
        }else{
            res.json({success:false})
        }
    } catch (error) {
        console.log(error.message)
    }
}


const listProducts = async(req,res)=>{
    try {
        
        const productId = req.query.id
        const listProduct = await productModel.findOneAndUpdate({_id:productId},{$set:{isListed:true}})
        
        if(listProduct){
            res.redirect('/admin/productList')
        }else{
            res.json({success:false})
        }
    } catch (error) {
        console.log(error.message)
    }
}

const postAddProduct = async (req, res) => {
    
    uploads(req, res, async (err) => {
        var fileNames = [];
        if (err) { 
            console.log('multer error', err);
            return res.status(500).json({error:"error uploading files"});
        } 

        try {
            const category = await categoryModel.find()
            const { productName, productDesc, productPrice, productQty,productBrand } = req.body;

            const sharpProm = req.files.map(async (file, index) => {
                
                const filename = `image_${index + 1}_${file.originalname}.${Date.now()}.jpg`;
                const imagePath = `public/uploads/${filename}`;

                await sharp(file.buffer).resize(800, 800, {
                    fit: 'contain', 
                    withoutEnlargement: true, 
                    background: 'white',
                }).toFile(imagePath, { quality: 90 });
                fileNames.push(filename);
            });
 
            await Promise.all(sharpProm);
            
            const ctg = req.body.productCat;
            const ctgData = await categoryModel.findOne({name:ctg})
            

            const imagePath = fileNames.map((filename) => `/uploads/${filename}`);
            // console.log(fg);

            const product = new productModel({
                name: productName,
                description: productDesc,
                brand:productBrand,
                price: productPrice,
                quantity: productQty,
                category: ctg,
                images: imagePath,
                isListed: true,
                categoryId:ctgData._id
                
            });

            await product.save();
            
            res.json({data:true})
            // res.render("addProducts",{message:true,category:category});
        } catch (error) {
            console.log(error.message);
        }
    });
};


const logout = async(req,res)=>{
    try {
        req.session.admin_id = null
        res.redirect('/admin/')
    } catch (error) {
        console.log(error.message)
    }
}


const postChangeUserStatus = async (req, res, next) => {
    try {
      const userId = req.query.userId
      await userModel.updateOne({ _id: userId }, { $set: { isBlocked: true } })
      res.redirect('/admin/users')
  
    } catch (error) {
      console.log(error.message);
      res.status(500).render('serverError', { message: error.message });
      next(error)
    }
  }

  const unblockUser = async (req, res, next) => {
    try {
      const userId = req.query.userId
      await userModel.updateOne({ _id: userId }, { $set: { isBlocked: false } })
      res.redirect('/admin/users')
  
    } catch (error) {
      console.log(error.message);
      res.status(500).render('serverError', { message: error.message });
      next(error)
    }
  }

  const dltProducts = async (req, res, next) => {
    try {
      const productId = req.query.id
      await productModel.findByIdAndDelete({ _id: productId })
      res.json({data:true})
      
    //   
  
    } catch (error) {
      console.log(error.message);
      //res.json({data:false})
      res.status(500).render('serverError', { message: error.message });
      next(error)
    }
  }

  const dltImage = async (req, res) => {
    try {
      const {imageUrl,productId} = req.body
      const removeImage = await productModel.findOneAndUpdate({_id:productId},{$pull:{images:imageUrl}})
      if(removeImage){
        res.json({success:true})
      }else{
        res.json({success:false})
      }
      
      
    //   
  
    } catch (error) {
      console.log(error.message);
      //res.json({data:false})
      res.status(500).render('serverError', { message: error.message });
      next(error)
    }
  }

  const editProduct = async (req, res, next) => {
    try {
      const productId = req.query.id
      const productData = await productModel.findOne({_id:productId})
      const category = await categoryModel.find()
      res.render('editProduct',{category,productData})
  
    } catch (error) {
      console.log(error.message);
      res.status(500).render('serverError', { message: error.message });
      next(error)
    }
  }


  const postEditProduct = async (req,res) =>{
    uploads(req, res, async (err) => {
        var fileNames = [];
        if (err) {
            console.log('multer error', err);
            return res.status(500).send("error uploading files");
        }
    
    
    try {
        const products = await productModel.find()
        const category = await categoryModel.find()
        const {productname,description,price,quantity,brand} = req.body
        const ctg = req.body.category
        const productId = req.query.id
        const sharpProm = req.files.map(async (file, index) => {
            const filename = `image_${index + 1}_${file.originalname}.${Date.now()}.jpg`;
            const imagePath = `public/uploads/${filename}`;

            await sharp(file.buffer).resize(600, 600, {
                fit: 'contain',
                withoutEnlargement: true,
                background: 'white',
            }).toFile(imagePath, { quality: 90 });
            fileNames.push(filename);
        });
    

        await Promise.all(sharpProm);

        const imagePath = fileNames.map((filename) => `/uploads/${filename}`);


        await productModel.findByIdAndUpdate({_id:productId},{name:productname,description:description,brand:brand,price:price,quantity:quantity,category:ctg,$push:{images:imagePath}})
        // res.json({data:true})
            res.render('productList',{category,products})
    }
        catch (error) {
        console.log(error.message)
    }

    }
)}

  

    







module.exports={
    loadDashboard,
    loadProductList,
    loadCategory,
    loadUsers,
    loadAddProducts,
    loadLogin,
    verifyAdmin,
    postCategory,
    loadEditCategory,
    postEditCategory,
    deleteCategory,
    postAddProduct,
    logout,
    postChangeUserStatus,
    unblockUser,
    dltProducts,
    editProduct,
    postEditProduct,
    loadOrders,
    unListProducts,
    listProducts,
    dltImage,
    loadSalesReport
    
}
const categoryModel = require("../model/categoryModel")
const productModel = require("../model/productModel")
const userModel = require('../model/userModel')
const multer = require('multer')
const sharp = require('sharp')

const storage = multer.memoryStorage()
const uploads = multer({storage:storage}).array('image',5)




const loadLogin = async(req,res)=>{
    try {
        res.redirect('/admin/dashboard')
    } catch (error) {
        console.log(error.message)
    }
}

const credential={
    email:"sudarsh@gmail.com",
    password:"sudarsh@123"
}


const verifyAdmin = async(req,res)=>{
    try {
        const {email,password} = req.body
        if(email===credential.email&&password===credential.password){
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
        res.render('adminDashboard')
    } catch (error) {
        console.log(error.message)
    }
}

const loadProductList = async(req,res)=>{
    try {
        const category = await categoryModel.find()
        const products = await productModel.find()
        res.render('productList',{category,products})
    } catch (error) {
        console.log(error.message)
    }
}

const loadCategory = async(req,res)=>{
    try {
        const category = await categoryModel.find()
        res.render('category',{category})
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
    await categoryModel.findByIdAndUpdate({ _id: req.body.id }, { name: req.body.name, description: req.body.description })
    res.redirect('/admin/category')

    
   } catch (error) {
    console.log(error.message)
   }
    
}


const postCategory = async(req,res)=>{
    try {
        const{name,description} = req.body
        const category = await categoryModel.find()
        if (!name || !description) {
            res.render('category',{category});
          }else{
            const ctg = new categoryModel({
                name: name,
                description: description,
                is_Listed: true
        
              })

              let ctgData = await ctg.save()
              
              if(ctgData){
                res.redirect('/admin/category')
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
        res.render('addProducts',{category})
    } catch (error) {
        console.log(error.message)
    }
}

const postAddProduct = async (req, res) => {
    uploads(req, res, async (err) => {
        var fileNames = [];
        if (err) {
            console.log('multer error', err);
            return res.status(500).send("error uploading files");
        }

        try {
            const { productname, description, price, quantity } = req.body;
            const sharpProm = req.files.map(async (file, index) => {
                const filename = `image_${index + 1}_${file.originalname}.${Date.now()}.jpg`;
                const imagePath = `public/uploads/${filename}`;

                await sharp(file.buffer).resize(300, 300, {
                    fit: 'contain',
                    withoutEnlargement: true,
                    background: 'white',
                }).toFile(imagePath, { quality: 90 });
                fileNames.push(filename);
            });

            await Promise.all(sharpProm);

            const category = req.body.category;
            // console.log(category);

            const imagePath = fileNames.map((filename) => `/uploads/${filename}`);
            // console.log(fg);

            const product = new productModel({
                name: productname,
                description: description,
                price: price,
                quantity: quantity,
                category: category,
                images: imagePath,
            });

            await product.save();
            // console.log(product);

            res.redirect("/admin/addProducts");
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
    unblockUser
}
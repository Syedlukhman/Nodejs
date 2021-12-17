const mongoose= require('mongoose')

mongoose.connect("mongodb://localhost:27017/Company")
                .then(()=>{
                    console.log("DB created successfully")
                })
                .catch((err)=>{
                    console.log("DB not created")

                })

const productSchema = new mongoose.Schema({
    productid:Number,
    productName:String,
    qtyPerUnit:Number,
    unitPrice:Number,
    unitStock:Number,
    discontinued:String,
    categoryId:Number
}) 

const categorySchema = new mongoose.Schema({
    categoryId:{
        type:Number,
        required : true
    },
    categoryName:
    {
        type:String,
        required:true
    }
})

const ProductModel= mongoose.model("product",productSchema)
const CategoryModel= mongoose.model("category",categorySchema)

module.exports={ProductModel,CategoryModel}
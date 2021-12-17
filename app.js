const express = require("express");
const app = express();
require("dotenv").config();
const db = require("./conn");
const path = require("path");
const { send } = require("process");

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.post("/create", async (req, res) => {
  const catID = req.body.categoryId; //catId to check if data has any category
  const checkProduct = req.body.productName; //checkProduct to check if a product with same name is already present
  const check = await db.ProductModel.find(
    { productName: checkProduct },
    { _id: 0, productName: 1 }
  );
  const checkId = await db.CategoryModel.find(
    { categoryId: catID },
    { _id: 0, categoryId: 1 }
  ); //check catID to check if category number is already present in database
  if (check != "") {
    //checks if product is already present
    res.send(
      "product is already present! product or category with existing product name or category id cannot be created!"
    );
  } else if (check == "" && catID != undefined) {
    //if product is not present and categoryid is there in new data
    if (checkId == "") {
      //id is empty
      //to check if categoryId from new data is empty and if productName and categoryID is not in db
      const productInsert = new db.ProductModel(req.body);
      const categoryInsert = new db.CategoryModel(req.body);
      const saveP = await productInsert.save();
      const saveC = await categoryInsert.save();
      res.send(
        "product " +
        saveP.productName +
        " and its category " +
        saveC.categoryName +
        " are saved successfully"
      );
    } else {
      //categoryid is already present
      res.send(
        "category with same categoryId is already present! product or category with existing product name or categoryid cannot be created!"
      );
    }
  } else {
    //only product is given as input
    const productInsert = new db.ProductModel(req.body);
    const savedb = await productInsert.save();
    res.send("product " + savedb.productName + " is saved successfully");
  }
});
app.get("/read/:productName", async (req, res) => {
  try {
    const productData = await db.ProductModel.findOne(
      { productName: req.params.productName },
      { _id: 0, __v: 0 }
    );
    let WholeData = [];
    console.log(productData.categoryId)
    if (productData) {
      //if product for given productName is present or not
      if (productData.categoryId != null) {
        const categoryData = await db.CategoryModel.findOne(
          { categoryId: productData.categoryId },
          { _id: 0, __v: 0 }
        );
        //if product has a category
        WholeData.push({
          productModel: productData, //pushes product model
          categoryModel: categoryData, //pushes  category_model
        });

        res.send(WholeData);
      } else {
        const data = {
          productModel: productData,
        };
        res.send(data);
      }
    } else {
      res.send(
        "product with name " + req.params.productName + " is not present"
      );
    }
  } catch (error) {
    console.log(error);
  }
});


app.get("/readAll", async (req, res) => {
  try {
    const productData = await db.ProductModel.find({}, { _id: 0, __v: 0 });
    let dataN = []; //array to store product n category model
    //for each loop on product model
    for (var i = 0; i < productData.length; i++) {
      if (productData[i].categoryId) { //checks if category for given product is present or not
        const CategoryData = await db.CategoryModel.find({ categoryId: productData[i].categoryId }, { _id: 0, __v: 0 });
        dataN.push(
          Product_Model=productData[i],
          Category_Model= CategoryData[0],
        
        )
      } else {
        dataN.push(
          Product_Model = productData[i], //pushes product model
        );
      }
    }
    res.send(dataN);
  } catch (error) {
    res.send(error.message);
  }
});

app.put("/update/:productName", async (req, res) => {
  try {
    const foundProduct = await db.ProductModel.find({ productName: req.params.productName }); //to check if product with given name is present or not
  // const checkId = foundProduct[0].categoryId
  // console.log(foundProduct=="")
  if (foundProduct!="") {
    if (req.body.categoryId != null) { // if product has category

      const productUpdate = await db.ProductModel.find({
        productName: req.params.productName,
      }).update({
        productid: req.body.productid,
        productName: req.body.productName,
        qtyPerUnit: req.body.qtyPerUnit,
        unitPrice: req.body.unitPrice,
        unitStock: req.body.unitStock,
        discontinued: req.body.discontinued,
        categoryId: req.body.categoryId
      });
      const checkId = foundProduct[0].categoryId
      const foundCategory = await db.CategoryModel.find({ categoryId: checkId })
      // if category is present

      if (foundCategory[0]) { //update the existing category

        const categoryUpdate = await db.CategoryModel.find({ categoryId: checkId }).update({
          categoryId: req.body.categoryId,
          categoryName: req.body.categoryName,
        })
        res.send("product " + req.body.productName + " and its category " + req.body.categoryName + " has been updated");

      }
      else {//else create a new category table and insert the values
        const categoryInsert = new db.CategoryModel(req.body);

        const saveC = await categoryInsert.save();
        res.send("product " + req.params.productName + " and its category " + req.body.categoryName + " is created");
      }

    } else {
      const update = await db.ProductModel.find({
        productName: req.params.productName,
      }).update({
        productid: req.body.productid,
        productName: req.body.productName,
        qtyPerUnit: req.body.qtyPerUnit,
        unitPrice: req.body.unitPrice,
        unitStock: req.body.unitStock,
        discontinued: req.body.discontinued,
      });
      res.send("product " + req.params.productName + " has been updated");
    }
  } else {
    res.send("product " + req.params.productName + "could not be found");
  }
  } catch (error) {
    console.log(error.message)
  }
});

app.delete("/delete/:productName", async (req, res) => {
  try {
    const productData = await db.ProductModel.findOne(
      { productName: req.params.productName },
      { _id: 0 }
    ); //check if porduct with given name is present
    // if(productData.categoryId==null){
    //   console.log("its null")
    // }else{
    //   console.log("its not null")
    // }
    if (productData) {

      if (productData.categoryId != null) {
        const id = await db.ProductModel.find(
          { productName: req.params.productName },
          { _id: 0, categoryId: 1 }
        );
        //check for categoryId
        const result = await db.ProductModel.findOneAndDelete({
          productName: req.params.productName,
        }); //deletes product
        const result1 = await db.CategoryModel.findOneAndDelete({
          categoryId: id[0].categoryId,
        }); //deletes category of corresponding product
        res.send(
          "product " + result.productName + " and its categories are deleted"
        );
      } else {
        //if category is not present delete the product table
        const result = await db.ProductModel.findOneAndDelete({
          productName: req.params.productName,
        });
        res.send("deleted product table is : " + result);
      }
    } else {
      //if given name is not present
      res.send(
        "product with name " + req.params.productName + " is not present"
      );
    }
  } catch (error) {
    console.log(error);
  }
});




const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`app is running on ${port}`);
});

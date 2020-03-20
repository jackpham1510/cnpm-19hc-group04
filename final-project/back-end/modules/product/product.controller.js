const log4js = require('log4js');
const logger = log4js.getLogger('Controllers');
const Joi = require('@hapi/joi');
const responseUtil = require('../../utils/response.util');
const HttpStatus = require("http-status-codes");
const { PRODUCT_MESSAGE, CONTROLLER_NAME } = require('./product.constant');
const { AddProductValidationSchema } = require('./validations/add-product.schema');
const { UpdateProductValidationSchema } = require('./validations/update-product.schema');
const CategoryModel = require('../category/category.model');
const SupplierModel = require('../supplier/supplier.model');
const ProductModel = require('./product.model');
const { CATEGORY_MESSAGE } = require('../category/category.constant');
const { SUPPLIER_MESSAGE } = require('../supplier/supplier.constant');
const { USER_MESSAGE, USER_ROLE } = require('../user/user.constant');
const { checkUserPermisson } = require('../user/user.service');
const mongoose = require('mongoose');

const addProduct = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::addProduct::was called`);
  try {
    const { error } = Joi.validate(req.body, AddProductValidationSchema);
    if (error) {
      return responseUtil.joiValidationResponse(error, res);
    }

    const productInfo = req.body;
    const category = await CategoryModel.findOne({ _id: mongoose.Types.ObjectId(productInfo.categoryID) });
    if (!category) {
      logger.info(`${CONTROLLER_NAME}::addProduct::category not found`);
      return res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        errors: [CATEGORY_MESSAGE.ERROR.CATEGORY_NOT_FOUND]
      });
    }

    const supplier = await SupplierModel.findOne({ _id: mongoose.Types.ObjectId(productInfo.supplierID) });
    if (!supplier) {
      logger.info(`${CONTROLLER_NAME}::addProduct::supplier not found`);
      return res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        errors: [SUPPLIER_MESSAGE.ERROR.SUPPLIER_NOT_FOUND]
      });
    }

    const duplicatedProduct = await ProductModel.findOne({ name: productInfo.name });
    if (duplicatedProduct) {
      logger.info(`${CONTROLLER_NAME}::addProduct::duplicated name`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        errors: [PRODUCT_MESSAGE.ERROR.DUPLICATED_PRODUCT]
      });
    }

    if (productInfo.availableQuantity && productInfo.availableQuantity < 0) {
      logger.info(`${CONTROLLER_NAME}::addProduct::invalid available quantity`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        errors: [PRODUCT_MESSAGE.ERROR.INVALID_PRODUCT_AVAILABLE_QUANTITY]
      });
    }

    if (productInfo.price && productInfo.price < 0) {
      logger.info(`${CONTROLLER_NAME}::addProduct::invalid price`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        errors: [PRODUCT_MESSAGE.ERROR.INVALID_PRODUCT_PRICE]
      });
    }

    productInfo.category = productInfo.categoryID;
    productInfo.supplier = productInfo.supplierID;
    delete productInfo.categoryID;
    delete productInfo.supplierID;

    const newProduct = new ProductModel(productInfo);
    await newProduct.save();

    category.products.push(newProduct._id);
    await category.save();

    supplier.products.push(newProduct._id);
    await supplier.save();

    logger.info(`${CONTROLLER_NAME}::addProduct::a new product was added`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: { product: newProduct },
      messages: [PRODUCT_MESSAGE.SUCCESS.ADD_PRODUCT_SUCCESS]
    })
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::addProduct::error`);
    return next(error);
  }
}

const updateProduct = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::updateProduct::was called`);
  try {
    const { error } = Joi.validate(req.body, UpdateProductValidationSchema);
    if (error) {
      return responseUtil.joiValidationResponse(error, res);
    }

    const { fromUser } = req;
    const isImporter = await checkUserPermisson(fromUser._id, USER_ROLE.IMPORTER.type);
    if (!isImporter) {
      logger.info(`${CONTROLLER_NAME}::updateProduct::permission denied`);
      return res.status(HttpStatus.UNAUTHORIZED).json({
        status: HttpStatus.UNAUTHORIZED,
        errors: [USER_MESSAGE.ERROR.PERMISSION_DENIED]
      });
    }

    const productInfo = req.body;
    if (productInfo.availableQuantity && productInfo.availableQuantity < 0) {
      logger.info(`${CONTROLLER_NAME}::updateProduct::invalid available quantity`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        errors: [PRODUCT_MESSAGE.ERROR.INVALID_PRODUCT_AVAILABLE_QUANTITY]
      });
    }

    if (productInfo.price && productInfo.price < 0) {
      logger.info(`${CONTROLLER_NAME}::updateProduct::invalid price`);
      return res.status(HttpStatus.BAD_REQUEST).json({
        status: HttpStatus.BAD_REQUEST,
        errors: [PRODUCT_MESSAGE.ERROR.INVALID_PRODUCT_PRICE]
      });
    }

    const { productID } = req.params;
    const product = await ProductModel.findOne({ _id: mongoose.Types.ObjectId(productID) });
    if (!product) {
      logger.info(`${CONTROLLER_NAME}::updateProduct::product not found`);
      return res.status(HttpStatus.NOT_FOUND).json({
        status: HttpStatus.NOT_FOUND,
        errors: [PRODUCT_MESSAGE.ERROR.PRODUCT_NOT_FOUND]
      });
    }

    for (const key in productInfo)
      product[key] = productInfo[key];
    await product.save();

    logger.info(`${CONTROLLER_NAME}::updateProduct::success`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: { product },
      messages: [PRODUCT_MESSAGE.SUCCESS.UPDATE_PRODUCT_SUCCESS]
    })
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::updateProduct::error`);
    return next(error);
  }
}

const getProducts = async (req, res, next) => {
  logger.info(`${CONTROLLER_NAME}::getProducts::was called`);
  try {
    const products = await ProductModel.find({})
      .populate('category', '-products')
      .populate('supplier', '-products');

    logger.info(`${CONTROLLER_NAME}::getProducts::success`);
    return res.status(HttpStatus.OK).json({
      status: HttpStatus.OK,
      data: { products },
      messages: [PRODUCT_MESSAGE.SUCCESS.GET_PRODUCTS_SUCCESS]
    })
  } catch (error) {
    logger.error(`${CONTROLLER_NAME}::getProducts::error`);
    return next(error);
  }
}

module.exports = {
  addProduct,
  updateProduct,
  getProducts
};
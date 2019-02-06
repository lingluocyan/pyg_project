const productModel = require('../models/product')
//详情相关的控制器
exports.index = (req, res, next) => {
  //1. 需要商品图片数据
  //2. 需要商品信息
  //3. 需要商品分类
  //4. 需要商品简介
  //5. 需要随机的商品列表信息
  const id = req.params.id
  Promise.all([
    productModel.getProduct(id, false),
    productModel.getLikeProducts()
  ]).then(results => {
    res.locals.detail = results[0]
    res.locals.likes = results[1]
    //res.json(res.locals)
    res.render('item.art')
  }).catch(err => next(err))
}
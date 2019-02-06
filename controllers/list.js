const productModel = require('../models/product')
const categoryModel = require('../models/category')
const pagination = require('../utils/pagination')
const qs = require('querystring')
//分类商品列表
exports.index = (req, res, next) => {
  //获取分类ID  ==> '/list/:id'
  const cateId = req.params.id
  //获取排序方式
  const sort = req.query.sort || 'commend' //如果没有排序默认是综合排序
  //获取分页的页码
  const page = req.query.page || 1  //如果没有页码默认是第一页
  //定义一页多少条
  const size = 5

  //需要 路径导航数据   当前分类的上一级分类 或者 上上级分类
  //需要 排序方式数据
  //需要 渲染分页数据
  //需要 列表数据
  // productModel.getCateProducts(cateId, page, size, sort)
  //   .then(data => {
  //
  //     res.locals.list = data
  //     res.render('list.art')
  //   })
  //   .catch(err => next(err))
  Promise.all([
    categoryModel.getCategoryParent(cateId),
    productModel.getCateProducts(cateId, page, size, sort)
  ]).then(results => {
    res.locals.cate = results[0] //分类数据
    res.locals.list = results[1].list //列表数据
    res.locals.sort = sort  //排序数据   price 降序  -price 升序
    //封装一个分页工具  生成分页的HTML格式的代码  根据数据来生成
    //pagination({page,total:results[1].total})
    res.locals.pagination = pagination({page, total: results[1].total, req})
    res.render('list.art')
  })
}
//搜索商品列表
exports.search = (req, res, next) => {
  //需要 根据搜索关键字列表数据
  const q = req.query.q
  const page = req.query.page || 1
  const sort = req.query.sort || 'commend'
  const size = 5
  //转URL编码 encodeURIComponent(q) 浏览器端拥有的但NODEJS也可以使用
  //转URL编码 querystring.escape(str)
  productModel.getSearchProducts(qs.escape(q), page, size, sort)
    .then(data => {
      res.locals.list = data.list
      res.locals.sort = sort
      res.locals.q = q
      res.locals.pagination = pagination({page, total: data.total, req})
      res.render('list.art')
    })
    .catch(err => next(err))
}
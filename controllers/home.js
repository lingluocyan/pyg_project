const homeModel = require('../models/home')
const productModel = require('../models/product')
//渲染首页
exports.index = (req, res, next) => {
  //首页的业务
  //1. 轮播图信息
  // homeModel.getSlider()
  //   .then(data => {
  //     res.locals.sliders = data
  //     res.render('home.art')
  //   })
  //   .catch(err => next(err))
  //2. 猜你喜欢信息
  // productModel.getLikeProducts().then(data => {
  //   res.locals.likes = data //数组
  //   res.render('home.art')
  // }).catch(err => {
  //   next(err)
  // })
  // 想要 两次请求并行走  等所有数据获取成功后 渲染页面
  // Promise.all() 当最慢的异步操作结束认为是成功
  // Promise.race() 当最快的异步操作结束认为是成功
  // 参数是数组  类型是Promise对象
  Promise.all([homeModel.getSlider(), productModel.getLikeProducts()])
    .then(results => {
      //返回的数据顺序和数组中是Promise对象一致
      res.locals.sliders = results[0]
      res.locals.likes = results[1]
      res.render('home.art')
    }).catch(err => {
    //任何的Promise对象走这里
    next(err)
  })
}
//猜你喜欢的数据
exports.like = (req, res, next) => {
  productModel.getLikeProducts().then(data => {
    res.json(data)
  }).catch(err => next(err))
}
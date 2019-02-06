const config = require('./config')
const categoryModel = require('./models/category')
const productModel = require('./models/product')
const cartModel = require('./models/cart')
const qs = require('querystring')
//自定义中间件

//页面需要的公用信息设置中间件
exports.base = (req, res, next) => {
  //1. 设置头部信息
  res.locals.site = config.site
  //2. 设置用户信息
  if (req.session.user) {
    res.locals.user = req.session.user
  }
  //3. 分类信息  获取树状的数据结构
  const getCategory = () => {
    if (req.app.locals.category) {
      res.locals.category = req.app.locals.category
      return Promise.resolve()
    } else {
      return categoryModel.getCategoryTree().then(data => {
        //当你请求第一次成功  缓存分类数据
        req.app.locals.category = data
        res.locals.category = data
      })
    }
  }
  //4. 获取购物车信息  登录的时候  未登录时候
  const getCart = () => {
    if (req.session.user) {
      return cartModel.find(req.session.user.id).then(list => {
        const headerCart = {
          list: list.map(item => item.name),
          amount: list.reduce((prev, item) => prev + item.amount, 0) //叠加操作
        }
        res.locals.headerCart = headerCart
      })
    } else {
      const cookieStr = req.cookies[config.cookie.cart_key] || '[]'
      const cartList = JSON.parse(cookieStr)
      const promiseArr = cartList.map(item => productModel.getProduct(item.id, true))
      return Promise.all(promiseArr)
        .then(products => {
          //商品列表信息比较多 且没有商品总数
          const headerCart = {
            list: products.map(item => item.name),
            amount: cartList.reduce((prev, item) => prev + item.amount, 0) //叠加操作
          }
          res.locals.headerCart = headerCart
        })
    }
  }

  Promise.all([getCategory(), getCart()])
    .then(() => {
      //想知道 两个异步的操作都执行完毕
      next()
    }).catch(err => {
    next(err)
  })
}

exports.checkLogin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/login?returnUrl=' + qs.escape(req.url))  //在url上回出现特殊字符或中文
  }
  //放行
  next()
}
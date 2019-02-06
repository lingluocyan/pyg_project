const config = require('../config')
const productModel = require('../models/product')
const cartModel = require('../models/cart')
//购物车路由中间件
exports.add = (req, res, next) => {
  //1. 判断是否登录  会把登录后用户信息存在session  user属性指定就是用户信息
  const id = req.query.id
  const amount = +req.query.amount || 1
  //登录状态
  if (req.session.user) {
    cartModel.add(req.session.user.id, id, amount)
      .then(data => {
        //需要商品一些数据
        res.redirect(`/cart/success?id=${id}&amount=${amount}`)
      }).catch(err => next(err))
  }
  //未登录状态
  else {
    //把购物车信息存在cookie中
    //约定存储信息的key和value
    //key : pyg_cart_key
    //value : json格式的数组 [{id:'商品id',amount:'件数'},...]
    /*1. 获取现在在cookie当中的购物车信息*/
    //注意：req.cookies 客户端所有cookie信息 是中间件提供的 cookie-parser
    const cookieStr = req.cookies[config.cookie.cart_key] || '[]'
    /*2. 把字符串数据转成 数组*/
    const cartList = JSON.parse(cookieStr)
    /*3. 添加购物车数据*/
    //购物车数据中是否已经有了现在加入购物车的商品
    const cart = cartList.find(item => item.id == id)
    if (cart) {
      //之前有商品  修改数量
      cart.amount += amount
    } else {
      //没有现在商品  追加
      cartList.push({id, amount})
    }
    /*4. 把修改好的购物车数据 再次存到cookie*/
    const expires = new Date(Date.now() + config.cookie.cart_expires)
    res.cookie(config.cookie.cart_key, JSON.stringify(cartList), {expires})

    res.redirect(`/cart/success?id=${id}&amount=${amount}`)
  }
}

exports.addAfter = (req, res, next) => {
  const {id, amount} = req.query
  /*5. 获取当前添加的商品信息 渲染页面*/
  productModel.getProduct(id, true)
    .then(data => {
      /*6. 设置有用的给模版*/
      res.locals.cartInfo = {
        id: data.id,
        name: data.name,
        thumbnail: data.thumbnail,
        amount
      }
      res.render('cart-add.art')
    })
    .catch(err => next(err))
}

/*响应页面*/
exports.index = (req, res, next) => {
  res.render('cart.art')
}
/*查询列表  响应json*/
exports.list = (req, res, next) => {
  if (req.session.user) {
    //登录状态查询购物车列表信息
    cartModel.find(req.session.user.id).then(data => {
      res.json({list: data})
    }).catch(err => {
      res.json([])
    })
  } else {
    //未登录状态的查询购物车列表信息
    /*1. 获取cookie信息*/
    const cookieStr = req.cookies[config.cookie.cart_key] || '[]'
    const cartList = JSON.parse(cookieStr)
    /*2. 根据存储的商品id获取页面需要的数据*/
    /*2.1 生成一个promise数组  有几个商品就生成几个*/
    const promiseArr = cartList.map(item => productModel.getProduct(item.id, true))
    /*2.2 去并行获取*/
    Promise.all(promiseArr).then(results => {
      //results 正好就是一个商品列表数据
      //处理一下 满足页面需要
      const list = results.map((item, i) => {
        return {
          id: item.id,
          name: item.name,
          thumbnail: item.thumbnail,
          price: item.price,
          amount: cartList[i].amount
        }
      })
      res.json({list})
    }).catch(err => {
      res.json([])
    })
  }
}
/*编辑*/
exports.edit = (req, res, next) => {
  const {id, amount} = req.body
  if (req.session.user) {
    //登录后的编辑
    cartModel.edit(req.session.user.id, id, amount)
      .then(data => {
        res.json({success: true})
      }).catch(err => {
      res.json({success: false})
    })
  } else {
    //未登录时的编辑
    /*1. 获取cookie数据*/
    const cookieStr = req.cookies[config.cookie.cart_key] || '[]'
    /*2. 转换成数组*/
    const cartList = JSON.parse(cookieStr)
    /*3. 根据商品的ID 找到你要修改的商品数据*/
    const cart = cartList.find(item => item.id == id)
    cart.amount = amount
    /*4. 更新客户端cookie数据*/
    const expires = new Date(Date.now() + config.cookie.cart_expires)
    res.cookie(config.cookie.cart_key, JSON.stringify(cartList), {expires})
    /*5. 响应客户端 是否操作成功*/
    res.json({success: true})
  }
}
/*删除*/
exports.remove = (req, res, next) => {
  const {id} = req.body
  if (req.session.user) {
    //TODO 登录后的删除
    cartModel.remove(req.session.user.id, id)
      .then(data => {
        res.json({success: true})
      }).catch(err => {
      res.json({success: false})
    })
  } else {
    //未登录时的删除
    const cookieStr = req.cookies[config.cookie.cart_key] || '[]'
    const cartList = JSON.parse(cookieStr)
    //根据索引删除 splice(index,1) 删除
    const index = cartList.findIndex(item => item.id == id)
    cartList.splice(index, 1)
    //更新
    const expires = new Date(Date.now() + config.cookie.cart_expires)
    res.cookie(config.cookie.cart_key, JSON.stringify(cartList), {expires})
    res.json({success: true})
  }
}
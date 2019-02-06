const svgCaptcha = require('svg-captcha')
const createError = require('http-errors')
const accountModel = require('../models/account')
const config = require('../config')
const cartModel = require('../models/cart')
//登录页面
exports.index = (req, res, next) => {
  //显示登录的页面
  //需要有验证码功能
  //同时需要显示验证码 在页面
  //创建验证码对象  包含 一张图片  图片的内容
  const captcha = svgCaptcha.createMathExpr({width: 108, height: 30, fontSize: 32})
  //响应一张验证码图片
  res.locals.svg = captcha.data //svg格式的字符串
  //保存验证码结果  给登录的时候使用
  //app 里面的数据是所有的客户端都会去操作的
  //存在session
  req.session.captcahText = captcha.text

  res.locals.returnUrl = req.query.returnUrl || '/member'
  res.render('login.art')
}

//登录逻辑
exports.login = (req, res, next) => {
  const body = req.body

  Promise.resolve().then(() => {
    /*1. 表单数据完整性校验*/
    if (!(body.username && body.password && body.captcha)) {
      throw createError(400, '提交信息不完整')
    }
    /*2. 校验验证码*/
    if (body.captcha !== req.session.captcahText) {
      throw createError(400, '验证码错误')
    }
    /*3. 校验用户名密码*/
    return accountModel.login(body.username, body.password)
  }).then(user => {
    //data 就是用户对象
    if (!(user && user.id)) {
      throw createError(400, '用户名或密码错误')
    }
    //证明登录已经成功
    req.session.user = user
    /*4. 自动登录功能*/
    if (body.auto == 1) {
      //在cookie中存储ID和密码  加密后的密码 不能使用 login 接口
      //思路：存储ID和密码  下次自动登录的时候 通过ID找到user的信息 然后去匹配密码
      const autoData = {uid: user.id, pwd: user.password}
      const expires = new Date(Date.now() + config.cookie.remember_expires)
      res.cookie(config.cookie.remember_key, JSON.stringify(autoData), {expires})
    }
    /*5. 合并购物车*/
    const cookieStr = req.cookies[config.cookie.cart_key] || '[]'
    const cartList = JSON.parse(cookieStr)
    //有几件商品 需要调用几次 添加购物车的接口
    const promiseArr = cartList.map(item => cartModel.add(user.id, item.id, item.amount))
    return Promise.all(promiseArr)
  }).then(() => {
    //合并成功 清除cookie
    res.clearCookie(config.cookie.cart_key)
    //登录逻辑 验证码清除
    req.session.captcahText = null
    //正常的逻辑  重定向 个人中心首页
    //来源页面是谁 跳转到谁
    res.redirect(body.returnUrl||'/member')
  }).catch(err => {
    //统一处理登录失败的错误
    res.locals.errorMessage = err.message
    if (err.status !== 400) {
      res.locals.errorMessage = '服务器繁忙'
    }
    //加上用户输入的 用户名和密码
    res.locals.username = body.username
    res.locals.password = body.password

    //错误需要更新验证码
    const captcha = svgCaptcha.createMathExpr({width: 108, height: 30, fontSize: 32})
    res.locals.svg = captcha.data
    req.session.captcahText = captcha.text
    res.render('login.art')
  })
}

//退出登录
exports.logout = (req, res, next) => {
  req.session.user = null
  //delete  req.session.user
  res.redirect('/login')
}
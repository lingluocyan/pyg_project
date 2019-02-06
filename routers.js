//汇总所有的路由
const express = require('express')
const router = express.Router()
const home = require('./controllers/home')
const account = require('./controllers/account')
const list = require('./controllers/list')
const item = require('./controllers/item')
const cart = require('./controllers/cart')
const member = require('./controllers/member')
const order = require('./controllers/order')
const pay = require('./controllers/pay')
const {checkLogin} = require('./middleware')

//首页展示
router.get('/', home.index)
//猜你喜欢接口
router.get('/like', home.like)

//列表页面
// url /list?id=100  req.query.id
// url /list/100     req.params.id
router.get('/list/:id(\\d+)', list.index)
router.get('/search', list.search)
//详情页面
router.get('/item/:id(\\d+)', item.index)

//购物车相关路由
router.get('/cart/add', cart.add)
router.get('/cart', cart.index)     //响应页面
router.get('/cart/list', cart.list)  //查询
router.post('/cart/edit', cart.edit)  //编辑
router.post('/cart/remove', cart.remove) //删除
router.get('/cart/success', cart.addAfter) //添加成功

//登录
router.get('/login', account.index)  //页面
router.post('/login', account.login) //登录逻辑
router.get('/logout', account.logout) //退出

router.get('/member', checkLogin, member.index)

//订单和支付
router.get('/order', checkLogin, order.index)
router.get('/order/create', checkLogin, order.create)
router.get('/checkout/:num', checkLogin, order.checkout)

router.get('/pay/:num(\\d+)', checkLogin, pay.index)

router.all('/pay/callback', checkLogin, pay.callback)

module.exports = router
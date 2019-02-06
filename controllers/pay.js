const alipay = require('../utils/alipay')
const orderModel = require('../models/order')

exports.index = (req, res, next) => {
  const num = req.params.num
  orderModel.detail(num)
    .then(order => {
      //获取支付地址   支付网关?参数项
      res.redirect(alipay.getPayUrl(order))
    }).catch(err => next(err))
}

exports.callback =  (req, res, next) => {
  console.log('=========================================')
  //out_trade_no 自己的订单编号
  const {out_trade_no,trade_no} = req.query
  const pay_status = 1 //已支付
  orderModel.edit(out_trade_no,pay_status,trade_no)
    .then(data=>{
      return orderModel.detail(out_trade_no)
    }).then(order=>{
    res.locals.order = order
    res.render('callback.art')
  }).catch(err=>{
    console.log(err)
    next(err)
  })
}
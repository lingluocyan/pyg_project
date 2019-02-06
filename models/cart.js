const axios = require('./api')
//购物车相关的数据操作

//添加
exports.add = (userId, productId, amount) => {
  return axios.post(`users/${userId}/cart`, {
    id: productId, amount
  }).then(res => res.data).catch(err => Promise.reject(err))
}
//修改
exports.edit = (userId, productId, amount) => {
  return axios.patch(`users/${userId}/cart/${productId}`, {amount})
    .then(res => res.data)
    .catch(err => Promise.reject(err))
}
//删除
exports.remove = (userId, productId) => {
  return axios.delete(`users/${userId}/cart/${productId}`)
    .then(res => res.data)
    .catch(err => Promise.reject(err))
}

exports.find = (userId) => {
  return axios.get(`users/${userId}/cart`).then(res => res.data).catch(err => Promise.reject(err))
}
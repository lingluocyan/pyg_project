const axios = require('./api')
//用户相关的数据操作
exports.login = (username, password) => {
  return axios.post('users/login', {username, password})
    .then(res => res.data).catch(err => {
      return Promise.reject(err)
    })
}
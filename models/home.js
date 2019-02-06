//通过 axios 插件   既可以在浏览器端使用  也可以在NODEjs中使用
const api = require('./api')

exports.getSlider = () => {
  return api.get('/settings/home_slides')
    .then(res => res.data)
    .catch(err => Promise.reject(err))
}
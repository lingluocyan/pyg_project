//操作产品相关的数据
const axios = require('./api')

//猜你喜欢数据
exports.getLikeProducts = () => {
  //res 响应报文对象  res.data 才是响应数据
  //.then()里面的 return 也会包装成一个 promise 对象
  //获取到了 .then() 的返回值  再次去调用 .then() 获取现在返回的数据
  //一定要去处理错误情况 catch 操作
  return axios.get('products?type=like&limit=6').then(res => {
    return res.data
  }).catch(err => {
    //不是 Promise.reject() 那么都是认为是一个成功的返回
    //抛给下一次调用 promise 对象 catch
    return Promise.reject(err)
  })
}

//获取某个分类下的产品
exports.getCateProducts = (cateId, page, size, sort) => {
  const url = `/categories/${cateId}/products?page=${page}&per_page=${size}&sort=${sort}`
  return axios.get(url).then(res => {
    //注意：这个接口的响应头中 x-total-pages 的属性  存储的是总条数数据
    return {list: res.data, total: res.headers['x-total-pages']}
  }).catch(err => Promise.reject(err))
}

//获取某个关键字下的产品  中文字 特殊字符 都会处理成URL编码
exports.getSearchProducts = (q, page, size, sort) => {
  const url = `products?page=${page}&per_page=${size}&sort=${sort}&q=${q}`
  return axios.get(url).then(res => {
    //注意：这个接口的响应头中 x-total-pages 的属性  存储的是总条数数据
    return {list: res.data, total: res.headers['x-total-pages']}
  }).catch(err => Promise.reject(err))
}

//获取商品的详情信息
exports.getProduct = (id, isBasic) => {
  return axios.get(`products/${id}` + (isBasic ? '' : '?include=introduce,category,pictures'))
    .then(res => res.data).catch(err => Promise.reject(err))
}
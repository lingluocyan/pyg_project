//操作分类相关的数据
const axios = require('./api')

exports.getCategoryTree = () => {
  //调用分类数据接口
  return axios.get('categories?format=tree').then(res=>res.data).catch(err=>Promise.reject(err))
}

exports.getCategoryParent = (cateId) =>{
  //调用分类包含上一级信息的接口
  return axios.get(`categories/${cateId}?include=parent`).then(res=>res.data).catch(err=>Promise.reject(err))
}

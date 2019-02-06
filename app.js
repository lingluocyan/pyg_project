//核心应用程序代码
const express = require('express')
const Youch = require('youch')
const createError = require('http-errors')
const path = require('path')
const artTemplate = require('express-art-template')
const logger = require('morgan')
const favicon = require('express-favicon')
const bodyParser = require('body-parser')
const session = require('express-session')
const mysqlSession = require('express-mysql-session')
const cookieParser = require('cookie-parser')

const config = require('./config')
const router = require('./routers')
const middleware = require('./middleware')

//创建应用
const app = express()
app.listen(3000, () => console.log('-- server start --'))

//使用很多中间件

//打印日志 放在中间件最上面
app.use(logger('dev'))
//静态资源
app.use('/', express.static(path.join(__dirname, 'public')))
//请求体数据解析
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))
//配置cookie出来中间件
app.use(cookieParser())
//会话处理
//1. 只是出来会话  express-session
//2. 会话持久化  express-mysql-session
const MySqlStore = mysqlSession(session)
const sessionStore = new MySqlStore(config.mysql)
app.use(session({
  key: 'PYGSID',
  secret: 'pyg_secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false
}))

//模版引擎
app.engine('art', artTemplate)
app.set('view options', {
  //调试模式  模版不会缓存  页面不会压缩
  debug: process.env.NODE_ENV !== 'production'
})
//网站小图标
app.use(favicon(path.join(__dirname, './public/favicon.ico')))

//配置公用的中间件  自定义
app.use(middleware.base)
//很多路由 ...
app.use(router)

//错误
app.use((req, res, next) => {
  //console.log(createError)
  //以上的路由走过了  是404 没找资源
  // const err = new Error('Not Found')
  // err.status = 404
  next(createError(404, 'Not Found'))
})
app.use((err, req, res, next) => {
  //走到中间件 如果错误有状态码就是  没有默认的就是服务端错误 500
  //输出的是字符串  有了模版引擎 响应一个页面
  //如果是生成环境  输出 404 500 页面
  //是开发环境
  const env = req.app.get('env')
  if (env === 'development') {
    //错误页面对象初始化
    const youch = new Youch(err, req)
    //生成错误页面的HTML代码响应给客户端
    return youch.toHTML().then((html) => res.send(html))
  }
  //是生产环境错误处理
  res.status(err.status || 500)
  res.locals.status = err.status === 404 ? 404 : 500
  res.render('error.art')
})

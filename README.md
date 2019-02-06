## 品优购前台项目实现

### 技术栈

MVC

Node.js

Session

MySQL

ES6

BootStrap

Express

axios

svgCaptcha

### 基本结构

导入数据库文件newshop.sql,修改config.js中的db数据库配置

```
module.exports = {
  db: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '123456',
    database: 'alishow64'
  },
  port: 3000,
  host: '127.0.0.1'
}

```

使用nodemon ./app.js启动服务,默认端口3000，测试账号itcast 123456

### 首页渲染

把公用的样式写入layouts中,需要的模块{{extend './layouts/frame.art'}}导入对应的模块即可,并在模板页面中的"坑"中写入内容

#### 配置公用信息

```
const axios = require('axios')
const config = require('../config')
//配置发送请求时的一些公用的信息
const instance = axios.create({
  baseURL: config.api.baseURL,
  timeout: 3000,
  auth: {
    username: config.api.username,
    password: config.api.password
  }
})

module.exports = instance
```

#### 请求接口

```
const api = require('./api')

exports.getSlider = () => {
  return api.get('/settings/home_slides')
    .then(res => res.data)
    .catch(err => Promise.reject(err))
}
```

#### 渲染数据到页面

```
const homeModel = require('../models/home')
const productModel = require('../models/product')
//渲染首页
exports.index = (req, res, next) => {
  Promise.all([homeModel.getSlider(), productModel.getLikeProducts()])
    .then(results => {
      //返回的数据顺序和数组中是Promise对象一致
      res.locals.sliders = results[0]
      res.locals.likes = results[1]
      res.render('home.art')
    }).catch(err => {
    //任何的Promise对象走这里
    next(err)
  })
}
```

### 猜你喜欢

请求接口=>拿到数据=>渲染页面

```
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
```

#### 渲染页面

```
在home.art中渲染猜你喜欢
<script>
  $('#likeBtn').on('click', function () {
    $.get('/like', function (data) {
      //map() 是数组提供的遍历函数  回调函数的返回值会替换之前数组中对应的数据
      // ['a','b'].map(item=>'ccc') => ['cc','cc']
      var html = data.map(function (item) {
        //item 每次遍历的对应对象
        return `
            <li class="yui3-u-1-6">
                <a href="/item/${item.id}" class="pic"><img src="${item.thumbnail}"></a>
                <p>${item.name}</p><h3>&yen;${item.price}</h3>
            </li>
          `
      }).join('')
      $('#likeList').fadeOut(function () {
        $(this).html(html).fadeIn()
      })
    })
  })
</script>
```

### 分页功能

```
const template = require('art-template')
const path = require('path')
const url = require('url')
/**
 * 生成分页的工具
 * @param options 传参对象
 */
module.exports = (options) => {
  //分页的业务逻辑
  //渲染这个分类需要：总页数 total 当前页 page  显示按钮个数 count
  //点击按钮后跳转的链接问题
  const total = options.total

  //total总页数
  if (total < 2) return ''

  const page = options.page
  const count = options.count || 5
  const req = options.req
  //console.log(req.url)
  //console.log(req.originalUrl)
  //=====获取地址栏所有的传参去修改其中的page====
  //1. 获取地址栏参数返回的是对象格式 {sort:'price',page:9}
  //2. 去修改page属性的值  .page = 10
  //3. 根据这个对象去还原URL的字符串格式的传参  url+?sort=price&page=10
  //const urlObject = url.parse(req.url, true) //返回的对象中包含一个query属性  对象包含传参的对象
  //urlObject.query.page = 10
  //urlObject里面还有一个search属性 就是？后面的字符串包含问号
  //console.log(urlObject.search)
  //urlObject.search = undefined
  //如果设置成undefined  就不是使用search生成URL地址
  //就会使用 query 对象  转换成键值对字符串  querystring模块的 stringify()函数 生成URL地址
  //console.log(url.format(urlObject))  //设置完数据后直接格式化是不会用到设置过的数据的
  const urlObject = url.parse(req.originalUrl, true)
  const getUrl = (currPage) => {
    urlObject.query.page = currPage
    urlObject.search = undefined
    return url.format(urlObject)
  }
  //函数已经封装好了 但是是否可以在模版中使用呢

  //输入框跳转  跳转的时候  其他的参数不能修改  只有page需要修改

  //注意动态生成的地方  页码按钮
  //需要知道  起始的按钮页码  结束按钮的页码
  //尽可能让当前页码在中间

  //理想情况 起始按钮
  let begin = page - Math.floor(count / 2)
  //当前页面往前推之后不满足页码的要求
  begin = begin < 1 ? 1 : begin

  //理想情况 结束按钮
  let end = begin + count - 1
  //当总页数小于按钮的页码
  end = end > total ? total : end

  // 但是结束的按钮页码比总页数大  当前你的按钮的个数足够
  // 需要往前推 足够显示count个按钮即可
  begin = end - count + 1
  begin = begin < 1 ? 1 : begin

  //渲染按钮
  //基于模版和数据
  //单独使用模版引擎来渲染
  //如果想在页面中使用  那么需要控制器中去计算分页需要的数据
  //所以在这封装HTML格式的代码  template('id',data)  template('url',data)
  const urlTemplate = path.join(__dirname, '../views/components/pagination.art')
  //注意 模版引擎输入HTML格式的内容会提前转移成普通字符串  < &lt; > &gt;
  //如果想输入HTML格式的字符串  {{@html}} {{#html}}  <%#=html%>
  //网络安全 xss攻击 ===> cross site script  跨站脚本（js,sql）攻击
  //如果输出的HTML格式 回去执行script脚本 如果这段脚本是恶意的 那么就是xss攻击
  //靠模版引擎输出的：'<script>while (true){alert("你被攻击了")} <\/script>'
  //默认输出的转义过后的字符串
  //在给网站提交数据的时候  后台会默认处理出转义过后的字符
  // 原生语法 <% %> 直接可以写任何的JS语法
  return template(urlTemplate, {page, begin, end, total, getUrl, query: urlObject.query})
}
```

#### 分页模板文件

需要使用的地方直接{{@pagination}}即可

```
<div class="fr page">
    <div class="sui-pagination pagination-large">
        <ul>
            {{if page > 1}}
            <li class="prev"><a href="{{getUrl(+page-1)}}">«上一页</a></li>
            {{else}}
            <li class="prev disabled"><a href="javascript:;">«上一页</a></li>
            {{/if}}
            {{if begin > 1}}
            <li class="dotted"><span>...</span></li>
            {{/if}}
            <% for(let i=begin;i<=end;i++){ %>
            <li class="{{page==i?'active':''}}"><a href="{{getUrl(i)}}">{{i}}</a></li>
            <% } %>
            {{if end < total}}
            <li class="dotted"><span>...</span></li>
            {{/if}}
            {{if page < total}}
            <li class="next"><a href="{{getUrl(+page+1)}}">下一页»</a></li>
            {{else}}
            <li class="next disabled"><a href="javascript:;">下一页»</a></li>
            {{/if}}
        </ul>
        <div>
            <span>共{{total}}页</span>
            <form style="display: inline-block" autocomplete="off">
                <!--有之前的传参表单隐藏元素-->
                {{each query}}
                    {{if $index !='page'}}
                    <input type="hidden" name="{{$index}}" value="{{$value}}">
                    {{/if}}
                {{/each}}
                到第
                <input type="text" name="page" class="page-num">
                页
                <button class="page-confirm">确定</button>
            </form>
        </div>
    </div>
</div>
```

### 加入购物车

```
const axios = require('./api')
//购物车相关的数据操作

//添加
exports.add = (userId, productId, amount) => {
  return axios.post(`users/${userId}/cart`, {
    id: productId, amount
  }).then(res => res.data).catch(err => Promise.reject(err))
}
```

数据持久化存储和加密

```
const MySqlStore = mysqlSession(session)
const sessionStore = new MySqlStore(config.mysql)
app.use(session({
  key: 'PYGSID',
  secret: 'pyg_secret',
  store: sessionStore,
  resave: false,
  saveUninitialized: false
}))

```

### 购物车

##### 获取数据相关逻辑

```
在models的product.js
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
```

##### 编辑购物车操作

```
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
```

### 验证码

```
在controllers中的account
const svgCaptcha = require('svg-captcha')
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

在需要的地方{{@svg}}
```



- axios  https://www.kancloud.cn/yunye/axios/234845
- 语法风格   https://standardjs.com/readme-zhcn.html
- 接口文档  https://documenter.getpostman.com/view/130308/newshop/RVncfwwX
- 支付流程  https://open.alipay.com/platform/home.htm
- postman https://www.getpostman.com/apps
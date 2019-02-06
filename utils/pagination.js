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
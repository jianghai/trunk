# Javascript toolkit builder

* 无需为了操作数据引入一个 Underscore ；
* 无需为了格式化日期引入一个 Moment ；
* 无需为了实现特殊需求自己写工具却没有时间测试而带来的 bug ；
* ...

目标不是实现一个大而全的工具函数库，而是**根据项目需要按需引入，同时省去了大量编写、测试、维护的成本。**


## 安装

```sh
$ git clone https://github.com/jianghai/util.git

$ npm install

# 自定义 src/util.js (Todo: 提供一个UI界面按需选择，无需修改源代码)

# 打包生成 build/util.js
$ grunt webpack
```


## 使用

```javascript
// CommonJS
var _ = require('util')
// ...
```

```javascript
// AMD
require(['util'], function(_) {
  // ...
})
```

```html
<!-- script直接引入 -->
<script src="util.js"></script>
<script>
console.log(_.percent(0.112)) // '11%'
</script>
```


## 文档

详见 [wiki](https://github.com/jianghai/util/wiki)


## Q&A

* 没有我想要的 API 怎么办 ？

  [New Issue](https://github.com/jianghai/util/issues/new) 申请添加
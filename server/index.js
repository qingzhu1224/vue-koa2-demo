const Koa = require('koa');
// koa配置
const Config = require('../config/koa.config');
const path = require('path');
const args = process.argv.splice(2);
console.log(args)
const app = new Koa();
//webpack热加载相关
const webpack = require("webpack");
const server = require('koa-static');
const bodyParser = require('koa-bodyparser');
const webpackConfig = require("../build/webpack.dev.conf");
// const devMiddleware = require("../build/devMiddleware");
// const hotMiddleware = require('../build/hotMiddleware');
const koaWebpack = require('koa-webpack');
if(args && args[0] == "production"){
  webpackConfig.mode = "production"
  webpackConfig.entry = { index: [path.resolve(__dirname, '../src/main.js')] }
  console.log(webpackConfig)
}else{
  // webpackConfig.entry = { index: ['webpack-hot-middleware/client?noInfo=true&reload=true', path.resolve(__dirname, '../src/main.js')] }
}
const compiler = webpack(webpackConfig);
// 生产打包并且监听
if(args && args[0] == "production"){
  Config.node.port = "8280"
  app.use(server(__dirname+"/dist/"));
}else{// 开发打包热加载
  // app.use(devMiddleware(compiler));
  // app.use(hotMiddleware(compiler));
  const middleware = koaWebpack({ compiler });
  app.use(middleware);
}
const onerror = require('koa-onerror'); // koa错误打印
const information = require('./information')// app.use(index);
information(app)
// 路由
const indexRouter = require('./routers/indexRouter')// app.use(index);
indexRouter(app)
app.use(bodyParser());
//错误信息处理
onerror(app);
//控制台打印请求信息
app.use(async(ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`);
});


app.listen(Config.node.port,() => {
  console.log('正在监听'+Config.node.port)
});

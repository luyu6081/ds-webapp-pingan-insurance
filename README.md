# SAMP 数据标准前端应用

## 目录结构

```
 +- externals/    # 外部模块，会通过 Yarn Workspaces 引入依赖
 |
 +- local/        # 本应用源码目录
 |
 +- .gitmodules   # Git 子模块定义，externals 的子目录都是 Git 子模块
 |
 +- package.json  # Yarn Workspaces 定义
```

## 开发准备

```sh
git submodule init  # 初始化 Git 子模块
git submodule update  # 更新 Git 子模块文件状态
yarn install  # 安装依赖
```

### Compiles and hot-reloads for development
```
yarn run serve
```

### Compiles and minifies for production
```
yarn run build
```

### Run your tests
```
yarn run test
```

### Lints and fixes files
```
yarn run lint
```

### Run your unit tests
```
yarn run test:unit
```

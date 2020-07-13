import './style.scss'
import Vue from 'vue'
import {
  Pagination as ElPagination,
} from 'element-ui'

Vue.use(ElPagination)

const CommonPagination = {
  name: 'CommonPagination',

  functional: true,

  render: (h, {props, listeners}) => {
    const _props = {
      ...props,
      layout: props.layout !== undefined ? props.layout : 'prev, pager, next',
      background: props.background !== undefined ? props.background : true,
    }

    return <el-pagination {...{props: _props, on: listeners}} class="app-pagination"/>
  },
}

export default {
  ...CommonPagination,
  install: Vue => Vue.component('common-pagination', CommonPagination),
}

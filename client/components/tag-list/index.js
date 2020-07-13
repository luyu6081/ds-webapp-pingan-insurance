import TagList from './tag-list.vue'

export default {
  ...TagList,
  install: Vue => Vue.component(TagList.name, TagList),
}

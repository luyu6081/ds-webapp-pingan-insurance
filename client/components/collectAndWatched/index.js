import CollectAndWatched from './collect-and-watched.vue'

export default {
  ...CollectAndWatched,
  install: Vue => Vue.component('collectAndWatched', CollectAndWatched),
}

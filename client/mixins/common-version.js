export default {
  data () {
    return {
      isReadOnly: null,
    }
  },
  beforeRouteEnter (to, from, next) {
    next(vm => {
      const {name} = from
      if (name === 'common-version') {
        vm.isReadOnly = true
      }
    })
  },
}

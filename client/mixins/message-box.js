export default {
  data () {
    return {
      messageBoxVisible: false,
      messageBoxData: {},
    }
  },
  methods: {
    message ({message = '保存成功！', type = 'success'} = {}) {
      this.$message({
        message,
        type,
      })
    },
    showMessageBox ({content, cancel = () => {}, confirm = () => {}} = {cancel: () => {}, confirm: () => {}}) {
      this.messageBoxVisible = true
      this.messageBoxData = {
        content,
        cancel,
        confirm,
      }
    },
  },
}

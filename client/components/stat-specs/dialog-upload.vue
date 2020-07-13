<template>
  <el-dialog title="上传"
             :visible.sync="isVisible"
             :before-close="handleClose"
             :close-on-click-modal="false"
             append-to-body
             width="640px"
             class="statistical-upload-dialog">
    <div class="content">
      <div class="content__row">
        <div class="label">重名处理：</div>
        <div class="value">
          <el-radio-group v-model="rename">
            <el-radio v-for="(item, index) in radioList"
                      :key="index"
                      :label="item.value">
              {{item.label}} <span class="info">{{item.info}}</span>
            </el-radio>
          </el-radio-group>
        </div>
      </div>
      <div class="content__row">
        <div class="label">上传文件：</div>
        <div class="value">
          <el-upload :action="action"
                     :accept="accept"
                     :data="formData"
                     :file-list="fileList"
                     :limit="1"
                     :multiple="false"
                     :on-change="handleChange"
                     :on-exceed="handleExceed"
                     :on-success="handleSuccess"
                     :on-remove="onRemove">
            <el-button><ej-icon icon="export"></ej-icon>文件上传</el-button>
            <div slot="tip" class="tip">
              <p>支持扩展名：.xlsx</p>
              <p><el-button type="text" @click="downloadTpl">下载模版</el-button>后导入</p>
            </div>
          </el-upload>
        </div>
      </div>
    </div>
    <div slot="footer">
      <el-button @click="onCancel">取消</el-button>
      <el-button type="primary" @click="onConfirm">提交</el-button>
    </div>
  </el-dialog>
</template>

<script>

  import {
    Button as ElButton,
    Dialog as ElDialog,
    Radio as ElRadio,
    RadioGroup as ElRadioGroup,
    Upload as ElUpload,
  } from 'element-ui'

  import {
    Icon as EjIcon,
  } from '@ej/ui'

  import runtimeArgs from '@/runtime-args'

  import QUERY_EXPORT_TEMPLATE from '~/graphql/common/ds-export-template-query.gql'
  import MUTATION_DS_FILE_SUBMIT_AUDIT from '~/graphql/common/ds-file-submit-audit-mutation.gql'

  export default {
    components: {
      ElButton,
      ElDialog,
      ElRadio,
      ElRadioGroup,
      ElUpload,
      EjIcon,
    },
    props: {
      visible: Boolean,
    },
    computed: {
      type () {
        const {name} = this.$route
        const typeObj = {
          'essentials': 'STANDARD',
          'stat-specs': 'STATISTICS',
          'index-manager-list': 'STATISTICS',
          'organizations': 'INSTITUTIONAL',
          'common-codes': 'CODE',
        }
        return typeObj[name]
      },
      action () {
        return `${this.fileUploadUrl}filesUpload`
      },
    },
    data () {
      return {
        isVisible: null,
        fileName: null,
        rename: 'IGNORE',
        radioList: [
          {value: 'IGNORE', label: '忽略', info: '若有重复名称则不导入'},
          {value: 'OVERRIDE', label: '覆盖', info: '若有重复名称则覆盖'},
          {value: 'TERMINATION', label: '终止', info: ''},
        ],
        accept: '.xlsx',
        fileList: [],
        formData: {
          serviceId: 'ds',
          ttl: -1,
        },
        file: null,
        fileUploadUrl: runtimeArgs.NUXT_ENV_FILE_HTTP_ENDPOINT,
      }
    },
    methods: {
      onRemove (file) {
        this.fileList = []
        this.file = null
      },
      onCancel () {
        this.fileList = []
        this.file = null
        this.$emit('update:visible', false)
      },
      async onConfirm () {
        if (!this.file) {
          this.$message.error('请选择上传文件！')
          return
        }
        const {fileName, type, rename: deal, file} = this
        const params = {
          fileName,
          type,
          deal,
          file,
        }
        await this.$apollo.mutate({
          mutation: MUTATION_DS_FILE_SUBMIT_AUDIT,
          variables: {
            ...params,
          },
          update: (store, {data: {data}}) => {
            if (data) {
              this.$message({
                dangerouslyUseHTMLString: true,
                message: `<div class="file-upload__message is-success">
                            文件上传成功！系统正在进行文件校验！详细情况请点击<a href="/standard-audit" target="__blank">标准审核</a>查看
                          </div>`,
              })
              this.onCancel()
            }
          },
        })
        // 上传
      },
      handleSuccess (response, file, fileList) {
        const {ambryId} = response[0]
        this.file = ambryId.substring(1)
      },
      handleExceed (files, fileList) {
        const length = files.length + fileList.length
        if (length) {
          this.$message.error('当前限制选择1个文件')
        }
      },
      handleChange (file, fileList) {
        if (file) {
          this.fileName = file.name
        }
      },
      async downloadTpl () {
        const {data: {data}} = await this.$apollo.query({
          query: QUERY_EXPORT_TEMPLATE,
          variables: {
            type: this.type,
          },
        })
        if (data) {
          window.open(`${this.fileUploadUrl}fileDownload?ambryId=${data}`, '_blank')
        }
      },
      handleClose (done) {
        done()
        this.onCancel()
      },
    },
    watch: {
      visible (newVal) {
        this.rename = 'IGNORE'
        this.file = null
        this.isVisible = newVal
      },
    },
  }
</script>

<style lang="scss">
  .statistical-upload-dialog {
    .content {
      &__row {
        @apply flex flex-row text-gray-darkest;

        font-size: 14px;
        line-height: 22px;

        .label {
          width: 70px;
        }

        .value {
          @apply flex-1 flex-shrink-0;

          margin-left: 8px;
        }
      }
    }

    .el-radio {
      @apply block;

      margin-bottom: 16px;

      &__label {
        color: #676767;
        line-height: 22px;
        font-size: 14px;

        .info {
          color: #aaaaaa;
          font-size: 12px;
          line-height: 20px;
          margin-left: 10px;
        }
      }
    }

    .ej-icon {
      @apply inline-block;

      width: 14px;
      height: 14px;
      margin-right: 8px;
    }

    .tip {
      color: #8d8d8d;
      font-size: 14px;
      line-height: 22px;

      p {
        margin-top: 8px;

        &:last-of-type {
          font-size: 12px;
          line-height: 20px;
          color: #a0a0a0;
        }

        .el-button--text {
          @apply text-blue;

          padding: 0;
          font-size: 14px;
          margin-left: 0;

          &:hover,
          &:focus {
            outline: none;
          }
        }
      }
    }
  }

  .file-upload__message.is-success {
    a {
      font-weight: bold;
      margin: 0 10px;
    }
  }
</style>

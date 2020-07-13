<script>
  import {
    Cascader as ElCascader,
    DatePicker as ElDatePicker,
    Form as ElForm,
    FormItem as ElFormItem,
    Input as ElInput,
    Option as ElOption,
    Radio as ElRadio,
    RadioGroup as ElRadioGroup,
    Select as ElSelect,
  } from 'element-ui'

  export default {
    components: {
      ElCascader,
      ElDatePicker,
      ElForm,
      ElFormItem,
      ElInput,
      ElOption,
      ElRadio,
      ElRadioGroup,
      ElSelect,
    },
    props: {
      rules: {
        type: Object,
        default: () => {},
      },
      list: Array,
      size: {
        type: String,
        default: 'mini',
      },
      inline: {
        type: Boolean,
        default: true,
      },
      form: Object,
      labelWidth: {
        type: Number,
        default: 100,
      },
    },
    data () {
      return {
        validate: false,
        autosize: {minRows: 2, maxRows: 4},
      }
    },
    methods: {
      async onSubmit () {
        try {
          this.validate = await this.$refs['ruleForm'].validate()
        } catch (e) {
          this.validate = false
        }
      },
      resetFields () {
        this.$refs['ruleForm'].resetFields()
      },
    },
    render (h) {
      const attrs = {model: this.form, rules: this.rules, size: this.size, inline: this.inline, labelWidth: `${this.labelWidth}px`}
      const inputMax = 30
      const numberMax = 10
      const textareaMax = 500
      return (
        <el-form attrs = {{...attrs}}
                 ref="ruleForm"
                 class="essentials-form">
          {
            this.list.map((x, i) => {
              const {label, key, type, labels, options = [], attrs, dataType, placeholder, handleChange = () => {}} = x
              return <el-form-item key={i}
                            label={label + '：'}
                            prop={key}
                            class={`el-form-item__${type}`}>
                {
                  (type === 'text' || type === 'textarea') && !dataType
                    ? <el-input type={x.type} v-model={this.form[x.key]} placeholder={placeholder} maxlength={type === 'textarea' ? textareaMax : inputMax} show-word-limit={type === 'textarea'} autosize={type === 'textarea' ? this.autosize : false} ></el-input> : ''
                }
                {
                  type === 'text' && dataType
                    ? <el-input type={x.type} vModel_number={this.form[x.key]} maxlength={type === 'textarea' ? textareaMax : numberMax} show-word-limit={type === 'textarea'}></el-input> : ''
                }
                {
                  type === 'select'
                    ? <el-select v-model={this.form[key]} attrs={{...attrs}}>
                      {
                        options.map(x => {
                          const {label, value} = x
                          return (
                            <el-option label={label} value={value}></el-option>
                          )
                        })
                      }
                    </el-select> : ''
                }
                {
                  type === 'radio' ? <el-radio-group v-model={this.form[key]}>
                    {
                      labels.map(l => { return <el-radio label={l.value}>{l.label}</el-radio> })
                    }
                  </el-radio-group> : ''
                }
                {
                  type === 'date' ? <el-date-picker v-model={this.form[key]} attrs={{...attrs}} placeholder={placeholder || '选择日期'}></el-date-picker> : ''
                }
                {
                  type === 'cascader' ? <el-cascader v-model={this.form[key]} attrs={{...attrs}} options={options} {...{on: {'change': handleChange}}} placeholder={placeholder}></el-cascader> : ''
                }
              </el-form-item>
            })
          }
        </el-form>
      )
    },
  }
</script>

<style lang="scss">
  $mini-height: 22px;

  .essentials-form.el-form {
    @apply flex flex-row flex-wrap;

    .el-form-item {
      @apply flex flex-row;

      flex-basis: 33.33%;
      margin-bottom: 16px;
      margin-right: 0;
      padding-right: 10px;

      &__textarea {
        @apply flex flex-row;

        flex-basis: 100%;
      }

      &__content {
        @apply flex-1;

        flex-basis: 100%;
      }

      &__label {
        @apply text-gray-darkest flex-shrink-0;
      }

      &--mini {
        .el-input {
          &__icon {
            line-height: $mini-height;
          }
        }

        .el-form-item {
          &__label,
          &__content {
            line-height: $mini-height;
          }
        }

        .el-form-item__label {
          padding-right: 0;
        }
      }
    }

    .el-input {
      &--mini,
      &__inner {
        height: auto;
        line-height: $mini-height;
      }
    }
  }
</style>

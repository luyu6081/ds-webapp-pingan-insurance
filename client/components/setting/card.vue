<template>
  <div class="setting-card">
    <div class="card"
        v-for="(card, cindex) in cardList"
        :key="cindex">
      <h4>{{ card.title }} <span class="info">{{ card.subTitle }}</span></h4>
      <el-form v-for="(item, lIndex) in card.list"
          :key="lIndex"
          :model="item"
          :rules="rules"
          ref="form">
        <el-form-item :label="card.leftLabel">
          <el-form-item prop="startProportion">
            <el-input v-model="item.startProportion" :disabled="!isEdit"></el-input>
          </el-form-item>
          <span class="split" :span="2">-</span>
          <el-form-item prop="endProportion">
            <el-input v-model="item.endProportion" :disabled="!isEdit"></el-input>
          </el-form-item>
        </el-form-item>
        <el-form-item :label="card.rightLabel">
          <span class="info">（分）</span>
          <el-form-item prop="score">
            <el-input v-model="item.score" :disabled="!isEdit">
              <template slot="prepend">+</template>
            </el-input>
          </el-form-item>
          <div class="btn-group" v-if="isEdit">
            <i v-for="(item, index) in iconList"
                :key="index"
                :class="`el-icon-${item}`"
                @click="onOperate(item, index, cindex, lIndex)"></i>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
  import {
    Form as ElForm,
    FormItem as ElFormItem,
    Input as ElInput,
  } from 'element-ui'

  export default {
    components: {
      ElForm,
      ElFormItem,
      ElInput,
    },
    props: {
      info: {
        type: Object,
        default: () => { return {} },
      },
      isEdit: Boolean,
    },
    data () {
      const validateNumber = (rule, value, callback) => {
        const {field} = rule
        const obj = {
          startProportion: '起始',
          endProportion: '结束',
          score: '得分',
        }
        if (!value) {
          return callback(new Error(`${obj[field]}值不能为空`))
        }

        let _val = Number.isNaN(Number(value))
        if (_val) {
          callback(new Error('请输入数字值'))
        } else {
          callback()
        }
      }
      return {
        iconList: ['plus', 'minus'],
        cardList: [
          {
            title: '落地分',
            subTitle: '（近三个月数据）',
            leftLabel: '落地度占比（%）',
            rightLabel: '得分',
            list: [],
          },
          {
            title: '错误分',
            subTitle: '（近三个月数据）',
            leftLabel: '错误占比（%）',
            rightLabel: '得分',
            list: [],
          },
        ],
        rowItem: {
          startProportion: null,
          endProportion: null,
          score: null,
        },
        rules: {
          startProportion: [
            {required: true, message: '请输入起始值', trigger: 'blur'},
            {validator: validateNumber, trigger: 'blur'},
          ],
          endProportion: [
            {required: true, message: '请输入结束值', trigger: 'blur'},
            {validator: validateNumber, trigger: 'blur'},
          ],
          score: [
            {required: true, message: '请输入得分', trigger: 'blur'},
            {validator: validateNumber, trigger: 'blur'},
          ],
        },
      }
    },
    methods: {
      onOperate (icon, index, cardIndex, listIndex) {
        if (!this.isEdit) return
        const curCard = this.cardList[cardIndex]
        const {list, title} = curCard
        switch (icon) {
          case 'plus': // 添加
            list.push(JSON.parse(JSON.stringify(this.rowItem)))
            break
          case 'minus': // 删除
            if (list.length === 1) {
              this.$message.error(`${title}至少保留一项！`)
              return
            }
            list.splice(listIndex, 1)
            break
        }
      },
    },
    watch: {
      info: {
        handler (newVal) {
          let {completeScoreSettings, errorScoreSettings} = newVal
          if (completeScoreSettings === undefined) {
            completeScoreSettings = [JSON.parse(JSON.stringify(this.rowItem))]
          }
          if (errorScoreSettings === undefined) {
            errorScoreSettings = [JSON.parse(JSON.stringify(this.rowItem))]
          }
          this.cardList[0].list = completeScoreSettings
          this.cardList[1].list = errorScoreSettings
        },
        immediate: true,
        deep: true,
      },
    },
  }
</script>

<style lang="scss">
  .setting-card {
    .card {
      @apply text-gray-darkest;

      font-size: 14px;
      line-height: 22px;
      &:not(:nth-of-type(1)) {
        margin-top: 40px;
      }

      h4 {
        margin-bottom: 8px;
      }
    }

    .el-form {
      @apply flex flex-row;

      line-height: 40px;

      &-item {
        @apply flex-1 flex-shrink-0;

        &__label,
        .split,
        .el-input,
        .btn-group {
          @apply inline-block align-middle;
        }

        &__label {
          margin-right: 12px;
        }

        &__content {
          @apply flex flex-row items-center;

          height: 40px;

          >.el-form-item {
            @apply flex-grow-0;

            flex-basis: 80px;
          }
        }

        .split {
          margin: 0 5px;
        }

        .el-input {
          width: 70px;

          &__inner {
            height: 24px;
            line-height: 24px;
          }

          &-group {
            width: 80px;

            &__prepend {
              @apply border-none bg-transparent absolute text-center text-blue;

              padding: 0;
              left: 10px;
              line-height: 24px;
              width: 10px;

              &+.el-input__inner {
                border-top-left-radius: 4px;
                border-bottom-left-radius: 4px;
                padding-left: 25px;
              }
            }
          }
        }
      }

      .btn-group {
        margin-left: 42px;

        i {
          @apply inline-block text-center text-blue cursor-pointer;

          width: 24px;
          height: 24px;
          line-height: 24px;
          box-sizing: border-box;
          border: 1px dashed #d9d9d9;
          margin: 0 8px;
        }
      }
    }
  }
</style>

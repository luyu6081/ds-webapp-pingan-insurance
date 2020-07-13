<template>
  <div class="data-subject bg-white pb-0 clearfix">
    <h3 class="data-subject-header clearfix">
      <p class="float-left">本月数据标准专题</p>
      <!-- <router-link :to="{name: 'home'}" class="look-more float-right">查看历史专题</router-link> -->
    </h3>
    <expand-comp maxHeight="340">
      <div v-html="subjectHtml" class="data-subject-content"></div>
    </expand-comp>
  </div>
</template>

<script>
  import xss from 'xss'

  import ExpandComp from '~/components/expand'

  export default {
    name: 'DataSubject',

    components: {
      ExpandComp,
    },

    props: {
      content: {
        type: String,
        default: '',
      },
    },

    computed: {
      subjectHtml () {
        return xss(this.content, {
          stripIgnoreTagBody: ['script'],
          onTagAttr: (tag, name, value, isWhiteAttr) => {
            if (tag === 'img' && name === 'src') {
              return `${name}="${xss.friendlyAttrValue(value)}"`
            }
          },
        })
      },
    },
  }
</script>

<style lang="scss">
  .data-subject {
    &-header {
      @apply bg-blue-lighter bg-white;

      padding: 21px;
      margin-bottom: 16px;

      p {
        @apply text-lg text-black font-bold;
      }

      .look-more {
        @apply text-blue text-sm;

        margin-top: 4px;
      }
    }
    &-content {
      padding: 0 24px;

      p {
        @apply text-gray-darkest;

        text-indent: 2em;
        line-height: 22px;
      }
      img {
        @apply mx-auto;

        max-height: 200px;
      }
    }
  }
</style>

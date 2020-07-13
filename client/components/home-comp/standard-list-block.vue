<template>
  <div class="standard-block">
    <h3 class="standard-block-header">{{title}}</h3>
    <div class="standard-wrap">
      <div class="standard-data">
        <div v-for="(item, idx) in standardData"
             :key="idx"
             class="standard-data-item">
          <slot :data="{idx, item}"></slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

  export default {
    name: 'StandardBlock',

    props: {
      title: {
        type: String,
        default: '标准',
      },
      standardData: {
        type: Array,
        required: true,
      },
    },
  }
</script>

<style lang="scss">
  .standard-block {
    @apply bg-white;

    padding: 0 21px 7px;

    &-header {
      @apply text-lg text-black font-bold pb-1;

      margin-bottom: 3px;
      border-bottom: 1px solid #e4e4e4;
    }

    .standard-data {
      @apply flex flex-wrap justify-between;

      padding: 0;

      &-item {
        @apply overflow-hidden;

        width: 48%;
        padding: 3px 0;
      }
    }
  }
</style>

<template>
  <div class="cc-map-create-card">
    <h3>{{title}}</h3>
    <div class="cc-map-create-card__content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
  export default {
    props: {
      title: String,
    },
  }
</script>

<style lang="scss">
  .cc-map-create-card {
    h3 {
      @apply text-gray-darkest font-bold;

      font-size: 14px;
      line-height: 22px;
      margin-bottom: 16px;
    }

    &__content {

    }
  }
</style>

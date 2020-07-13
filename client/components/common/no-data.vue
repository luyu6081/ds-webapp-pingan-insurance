<template>
  <div class="no-data">
    <div class="no-data__content">
      <img src="~/assets/no-data.svg"/>
      <p>暂无数据</p>
    </div>
  </div>
</template>

<style lang="scss">
.no-data {
  @apply bg-white text-gray-dark text-center relative;

  width: 100%;
  height: 100%;
  font-size: 12px;
  line-height: 17px;

  &__content {
    @apply absolute;

    top: 50%;
    left: 50%;
    transform: translate3d(-50%, -50%, 0);
  }

  img {
    @apply inline-block;
  }

  p {
    margin-top: 11px;
  }
}
</style>

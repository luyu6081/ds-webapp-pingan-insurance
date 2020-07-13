<template>
  <div class="standard-audit-card">
    <div class="standard-audit-card__header">
      <slot name="header"></slot>
    </div>
    <slot></slot>
  </div>
</template>

<style lang="scss">
  .standard-audit-card {
    @apply bg-white;

    width: 100%;
    box-shadow: 0 2px 10px 0 rgba(0,0,0,.1);
    margin-top: 20px;
    padding: 16px 24px;

    &__header {
      font-size: 14px;
      line-height: 22px;
      font-weight: bold;
    }
  }
</style>

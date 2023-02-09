<template>
    <button class="live2d-setting"><van-icon name="arrow" /></button>
</template>

<script setup lang="ts">
</script>

<style lang="scss" scoped>
.live2d-setting {
    position: fixed !important;
    right: 1rem;
    bottom: 8rem;
    z-index: 100;
    width: 3rem;
    height: 3rem;
    padding: 0.5rem;
    border-radius: 1rem;
    background: var(--c-bg, #fff);
    color: var(--c-brand, #3eaf7c);
    box-shadow: 2px 2px 10px 0 var(--card-shadow);
    border-width: 0;
    cursor: pointer;
}
</style>
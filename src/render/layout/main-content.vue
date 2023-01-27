<script setup lang="ts">
const showFrame = window.showFrame;
defineProps({
  height: {
    type: String,
    default: "35px",
  },
});
</script>

<template>
  <div
    id="main-content"
    class="relative dark:bg-selfBgColor"
    :style="
      showFrame
        ? {
            top: 0,
            height: `100%`,
          }
        : {
            top: height,
            height: `calc(100% - ${height})`,
          }
    "
  >
    <slot></slot>
  </div>
</template>

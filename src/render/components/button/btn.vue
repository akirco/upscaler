<script setup lang="ts">
defineProps({
  title:String
})
</script>

<template>
  <div class="flex items-center pt-4 pl-4">
    <button
      id="toggle"
      :title="title"
      class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      {{title}}
    </button>
  </div>
</template>


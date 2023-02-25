<script setup lang="ts">
import { onMounted, ref } from "vue";
import maxIcon from "@/assets/icons/max.svg";
import restoreIcon from "@/assets/icons/restore.svg";

const Icon = ref(maxIcon);
const showFrame = window.showFrame;
const ipcRenderer = window.ipcRenderer;
defineProps({
  title: {
    type: String,
    default: "electron-vue-starter",
  },
  height: {
    type: String,
    default: "35px",
  },
  fontSize: {
    type: String,
    default: "12px",
  },
});

onMounted(() => {
  ipcRenderer.on("isMaxed", (_e, state) => {
    if (state === "false") {
      Icon.value = restoreIcon;
    }
    if (state === "true") {
      Icon.value = maxIcon;
    }
  });
});

function winMinSize() {
  ipcRenderer.send("windowMinSize", true);
}

// function toggleSize() {
//   ipcRenderer.send("toggleSize", true);
//   ipcRenderer.on("winState", (event, args) => {
// console.log("渲染进程收到的消息是：", args);
//     if (args === "maximize") {
//       Icon.value = restoreIcon;
//     } else if (args === "restore") {
//       Icon.value = maxIcon;
//     }
//   });
// }

function winClosed() {
  ipcRenderer.send("windowClosed", true);
}

</script>

<template>
  <div v-if="!showFrame" :style="!showFrame ? { height: height } : { height: 0 }"
    class="w-full text-gray-500 fixed border-b-[1px] border-b-light-400 bg-gray-50 dark:bg-selfBgColor dark:border-b-selfBorder">
    <div id="drag-region" class="w-full h-full flex">
      <div class="flex-grow flex items-center">
        <div class="w-[50px] flex items-center justify-center select-none" :style="{ height: height }" id="top">
          <!-- <span id="fixed"></span> -->
        </div>
        <span :style="{ fontSize: fontSize }" class="whitespace-nowrap text-ellipsis font-sans text-xs m-auto">
          {{ title }}
        </span>
      </div>
      <div id="window-controls" class="grid top-0 right-0 h-full select-none w-[100px]" draggable="false">
        <!-- <div class="flex justify-center items-center h-full w-full select-none btn btn-ghost normal-case min-h-0"
                    @click="toSetting">
                    <img class="icon" :srcset="setting" draggable="false" />
                  </div> -->
        <div
          class="flex justify-center items-center h-full w-full select-none hover:bg-gray-200 dark:hover:bg-gray-600 active:bg-zinc-500"
          @click="winMinSize">
          <img class="icon" srcset="../../assets/icons/min.svg 2.5x" draggable="false" />
        </div>
        <div class="flex justify-center items-center h-full w-full select-none hover:bg-red-500 active:bg-red-200"
          @click="winClosed">
          <img class="icon" srcset="../../assets/icons/closed.svg 1.85x" draggable="false" />
        </div>
      </div>
      <!--end window-->
    </div>
  </div>
</template>

<style scoped>
@import url("../../assets/style/titlebar.css");
</style>

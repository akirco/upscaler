<script setup lang="ts">
import { reactive, ref, onMounted, computed, watch } from "vue";
import { useLoading } from 'vue-loading-overlay'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import type { PluginApi, ActiveLoader } from "vue-loading-overlay"
import MainContent from "@/layout/main-content.vue";
import TopBar from "@/components/titleBar";
import ImageViewer from "@/components/imageViewer/ImageViewer.vue";
import TipBox from "./components/tipBox/TipBox.vue";
import empty from '@/assets/icons/empty.svg'
import setting from "@/assets/icons/setting.svg"
import { getOutputPath } from "@/utils/index"
import { channels } from "../libs/channels"
import { commands } from "../libs/commands";


const ipcRenderer = window.ipcRenderer
const upscaler = reactive({
  realesrgan: "realesrgan-ncnn-vulkan",
  realsr: "realsr-ncnn-vulkan"
})
const scale = ref(4);
const picked = ref(upscaler.realesrgan)
const selected = ref("");

const models = computed(() => {
  if (picked.value === upscaler.realesrgan) {
    return ["realesrgan-x4plus-anime", "realesrgan-x4plus", "remacri", "4x-AnimeSharp-opt-fp16", "4x-AnimeSharp-opt-fp32", "ultrasharp", "ultramix_balanced"];
  } else {
    return ["models-DF2K", "models-DF2K_JPEG"];
  }
})
watch(picked, (value, oldVal) => {
  if (value === upscaler.realesrgan) {
    selected.value = "realesrgan-x4plus"
  } else {
    selected.value = "models-DF2K"
  }
}, { immediate: true })
const model = ref(selected)
const disabled = ref(true)
const inputFile = ref(empty)
const outputFile = ref(empty);
const isSelected = ref(false)
const container = ref()
const slotText = ref("")
const showInfo = ref(false)
let loading: PluginApi = null;
let loader: ActiveLoader = null;

onMounted(() => {
  loading = useLoading({
    backgroundColor: '#242933',
    opacity: 0.5,
    color: '#61afef',
    loader: 'spinner',
    container: container.value
  })
})

const selectInput = async () => {
  const inputPath = await ipcRenderer.invoke(channels.selectInput);
  if (inputPath === "cancelled") return;
  disabled.value = false
  isSelected.value = true
  inputFile.value = "images:///" + inputPath;
}
const startEnhanced = async () => {
  const opts = {
    "upscaler": picked.value,
    "scale": scale.value,
    "model": model.value,
    "input": inputFile.value.substring(10),
    "output": getOutputPath(model.value, inputFile.value.substring(10)),
  }

  ipcRenderer.send(channels.startEhanced, opts);
  loader = loading.show()
}

ipcRenderer.on(commands.upscale, (_, data) => {
  if (data.length > 0 && data.length < 10) {
    if (data === "0.00%") {
      slotText.value = "即将处理..."
    }
    slotText.value = data
    ipcRenderer.on(commands.done, () => {
      slotText.value = ""
      loader.hide()
      outputFile.value = "images:///" + getOutputPath(model.value, inputFile.value.substring(10));
    })
  }
})
ipcRenderer.on(commands.failed, () => {
  showInfo.value = true
  setTimeout(() => {
    showInfo.value = false
  }, 3500)
  // ipcRenderer.send(commands.reload)
})


const reset = () => {
  inputFile.value = empty
  outputFile.value = empty
  isSelected.value = false
  disabled.value = true
}

const openExternalGithub = () => {
  ipcRenderer.send(commands.openExternalGithub, "https://github.com/akirco/upscaler")
}

</script>

<template>
  <TopBar title=""></TopBar>
  <MainContent>
    <div class="fixed top-10 w-56 text-right right-[10px] z-[9999]">
      <Menu as="div" class="relative inline-block text-left">
        <div>
          <MenuButton class="btn btn-active btn-ghost min-h-0 h-[35px]">
            Help
            <img class="ml-2 -mr-1 h-5 w-5 text-violet-200 hover:text-violet-100" :srcset="setting" draggable="false" />
          </MenuButton>
        </div>
        <transition enter-active-class="transition duration-100 ease-out"
          enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
          leave-active-class="transition duration-75 ease-in" leave-from-class="transform scale-100 opacity-100"
          leave-to-class="transform scale-95 opacity-0">
          <MenuItems
            class=" shadow-2xl absolute right-0 mt-2 w-56 origin-top-right  rounded-md  bg-dropDownBg  ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div class="px-1 py-1">
              <MenuItem v-slot="{ active }">
              <button :class="[
                active ? 'bg-selfBgColor text-white' : 'text-gray-400',
                'group flex w-full items-center rounded-md px-2 py-2 text-sm',
              ]">
                <div :active="active" class="mr-2 h-5 w-5 text-violet-400" aria-hidden="true"></div>
                Change Mode
              </button>
              </MenuItem>
              <MenuItem v-slot="{ active }">
              <button :class="[
                active ? 'bg-selfBgColor text-white' : 'text-gray-400',
                'group flex w-full items-center rounded-md px-2 py-2 text-sm',
              ]" @click="openExternalGithub">
                <div :active="active" class="mr-2 h-5 w-5 text-violet-400" aria-hidden="true"></div>
                Github Repo
              </button>
              </MenuItem>
            </div>
            <div class="px-1 py-1">
              <MenuItem v-slot="{ active }">
              <button :class="[
                active ? 'bg-selfBgColor text-white' : 'text-gray-400',
                'group flex w-full items-center rounded-md px-2 py-2 text-sm',
              ]">
                <div :active="active" class="mr-2 h-5 w-5 text-violet-400" aria-hidden="true"></div>
                Check update
              </button>
              </MenuItem>
              <MenuItem v-slot="{ active }">
              <button :class="[
                active ? 'bg-selfBgColor text-white' : 'text-gray-400',
                'group flex w-full items-center rounded-md px-2 py-2 text-sm',
              ]">
                <div :active="active" class="mr-2 h-5 w-5 text-violet-400" aria-hidden="true"></div>
                Help
              </button>
              </MenuItem>
            </div>
            <div class="px-1 py-1">
              <MenuItem v-slot="{ active }">
              <button :class="[
                active ? 'bg-selfBgColor text-white' : 'text-gray-400',
                'group flex w-full items-center rounded-md px-2 py-2 text-sm',
              ]">
                <div :active="active" class="mr-2 h-5 w-5 text-violet-400" aria-hidden="true"></div>
                About
              </button>
              </MenuItem>
            </div>
          </MenuItems>
        </transition>
      </Menu>
    </div>
    <div class="grid grid-cols-3 gap-2 h-full w-full p-3">
      <div
        class="w-full h-full col-span-2 bg-base-100  rounded-lg shadow-xl p-3 border-gray-700 border-2 border-dashed border-dark-50"
        ref="container">
        <TipBox content="文件处理失败，请稍后重试..." v-if="showInfo"
          class="fixed left-[12%] top-[12%] w-[400px] z-[9999] shadow-2xl" />
        <ImageViewer width="614" height="564" class="m-auto">
          <template #left>
            <img :src="inputFile" class="rounded-lg shadow-lg object-contain h-[100%] w-[96%]" />
          </template>
          <template #right>
            <img :src="outputFile" class="rounded-lg shadow-lg object-contain h-[100%] w-[96%]" />
          </template>
        </ImageViewer>
        <p class="fixed left-[48%] bottom-[46%]  text-white font-semibold z-[9999] opacity-100">{{
          slotText.split("%")[0]
        }}</p>
      </div>
      <div class="h-full w-full flex justify-between flex-col">
        <div class="grid grid-rows-3 gap-5">
          <div>
            <div class="badge badge-primary badge-outline">upscaler</div>
            <div class="divider mt-0"></div>
            <div class="grid grid-rows-2 gap-3">
              <div class="flex gap-3">
                <input type="radio" name="radio-1" class="radio radio-primary" :value="upscaler.realesrgan"
                  v-model="picked" />
                <label for="radio-1">{{ upscaler.realesrgan }}</label>
              </div>
              <div class="flex gap-3">
                <input type="radio" name="radio-2" class="radio radio-primary" :value="upscaler.realsr
                " v-model="picked" />
                <label for="radio-2">{{ upscaler.realsr }}</label>
              </div>
            </div>
          </div>
          <div>
            <div class="badge badge-primary badge-outline">scale</div>
            <div class="divider mt-0"></div>
            <input type="range" min="1" max="4" v-model="scale" class="range" step="1" />
            <div class="w-full flex justify-between text-xs px-2">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
            </div>
          </div>
          <div>
            <div class="badge badge-primary badge-outline">models</div>
            <div class="divider mt-0"></div>
            <select class="select select-bordered w-full max-w-xs" v-model="model">
              <option v-for="item in models">{{ item }}</option>
            </select>
          </div>
        </div>
        <div>
          <div class="card w-[calc(100%-1px)] bg-base-100 shadow-xl h-[calc(100%-1px)]">
            <div class="card-body items-center text-center gap-5">
              <button :disabled="!disabled" class="btn btn-wide mt-3 btn-accent" type="button" v-if="!isSelected"
                @click="selectInput">
                select image
              </button>
              <button class="btn btn-wide mt-3 btn-accent" type="button" v-if="isSelected" @click="reset">
                reset
              </button>
              <button class="btn btn-wide mt-3" type="button" @click="startEnhanced" :disabled="disabled">
                start
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainContent>
</template>

<style scoped>
* {
  color: #a2a9b6;
}
</style>

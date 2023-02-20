<script setup lang="ts">
import { reactive, ref, onMounted, computed, watch, toRaw } from "vue";
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

const model = ref(selected)
const inputFile = ref(empty)
const outputFile = ref(empty);
const container = ref()
const slotText = ref("")
const showInfo = ref(false)
const checkedModeFlag = ref("")
const parallelTasks = ref([])
const parallelCount = ref(1);
let loading: PluginApi = null;
let loader: ActiveLoader = null;

const taskStatus = reactive({
  currentTask: "",
  progress: 0,
})

const taskCompleted = ref(false)
const isSingleMode = ref(true)
const commonState = reactive({
  menuDisabled: false,
  radioDiabled: false,
  rangeDisabled: false,
  selectDisabled: false,
})
const singleState = reactive({
  selectImageVisable: true,
  selectImageDisabled: false,
  resetVisable: false,
  startDisabled: true,
  startVisable: true
})
const parallelState = reactive({
  selectFolderVisable: true,
  selectFolderDisabled: false,
  resetVisable: false,
  resetDisabled: false,
  startDisabled: true,
  startVisable: true
})


watch(picked, (value, oldVal) => {
  if (value === upscaler.realesrgan) {
    selected.value = "realesrgan-x4plus"
  } else {
    selected.value = "models-DF2K"
  }
}, { immediate: true })
watch(isSingleMode, (value, oldVal) => {
  // console.log(value);
  // single 
  if (value) {
    checkedModeFlag.value = "🙈"
  } else {
    // parallel
    checkedModeFlag.value = "🙉"
  }
}, { immediate: true })

watch(inputFile, (val, old) => {
  if (val !== empty) {
    singleState.selectImageVisable = false
    singleState.resetVisable = true
    singleState.startDisabled = false
  }
}, { immediate: true })

watch(parallelTasks, (val, old) => {
  // console.log(toRaw(val).length);
  if (toRaw(val).length > 0) {
    parallelState.selectFolderVisable = false
    parallelState.resetVisable = true
    parallelState.startDisabled = false
  }
}, { immediate: true, deep: true })


loading = useLoading({
  backgroundColor: '#242933',
  opacity: 0.3,
  color: '#61afef',
  loader: 'spinner',
  container: container.value
})


const selectInput = async () => {
  const inputPath = await ipcRenderer.invoke(channels.selectInput);
  if (inputPath === "cancelled") return;
  inputFile.value = "images:///" + inputPath;
}

const selectFolder = async () => {
  const files: string[] | "cancelled" = await ipcRenderer.invoke(channels.selectFolder);
  if (files === "cancelled") return;
  if (files.length > 0) {
    files.forEach(file => {
      parallelTasks.value.push(file)
    });
  }
}

const startEnhanced = async () => {
  let options = {}
  if (isSingleMode.value) {
    options = {
      "upscaler": picked.value,
      "scale": scale.value,
      "model": model.value,
      "input": inputFile.value.substring(10),
      "output": getOutputPath(model.value, inputFile.value.substring(10)),
    }
    ipcRenderer.send(channels.startSingleTask, options);
    // singleState
    commonState.menuDisabled = true;
    loader = loading.show()
  } else {
    options = {
      "upscaler": picked.value,
      "scale": scale.value,
      "model": model.value,
      "parallelCount": parallelCount.value,
      "inputs": toRaw(parallelTasks.value)
    }
    ipcRenderer.send(channels.startParallelTasks, options);
    parallelState.resetDisabled = true
    parallelState.startDisabled = true
    commonState.menuDisabled = true;
  }
}

// * single mode
ipcRenderer.on(commands.upscale, (_, data) => {
  if (data.length > 0 && data.length < 10) {
    if (data === "0.00%") {
      slotText.value = "即将处理..."
    }
    slotText.value = data
  }
})
ipcRenderer.on(commands.parallel, (_, data) => {
  taskStatus.currentTask = data.currentTask
  taskStatus.progress = data.progress
})
ipcRenderer.on(commands.failed, () => {
  showInfo.value = true
  setTimeout(() => {
    showInfo.value = false
  }, 3500)
})
ipcRenderer.on(commands.done, () => {
  loader.hide()
  commonState.menuDisabled = false;
  slotText.value = ""
  outputFile.value = "images:///" + getOutputPath(model.value, inputFile.value.substring(10));
})
ipcRenderer.on(commands.parallelDone, () => {
  taskCompleted.value = true
  taskStatus.currentTask = ""
  taskStatus.progress = 0
  parallelState.resetDisabled = false
  commonState.menuDisabled = false;
})
const singleModeReset = () => {
  singleState.selectImageVisable = true
  singleState.resetVisable = false
  singleState.startDisabled = true
  inputFile.value = empty
  outputFile.value = empty
}
const parallelModeReset = () => {
  parallelState.selectFolderVisable = true
  parallelState.resetVisable = false
  parallelState.startDisabled = true
  parallelTasks.value = []
  taskCompleted.value = false
  taskStatus.currentTask = ""
  taskStatus.progress = 0
}

const toggleMode = () => {
  isSingleMode.value = !isSingleMode.value
}

const plusParallel = () => {
  parallelCount.value < 3 ? parallelCount.value++ : parallelCount.value = 3
}

const subParallel = () => {
  parallelCount.value > 1 ? parallelCount.value-- : parallelCount.value = 1;
}


const openExternalGithub = () => {
  ipcRenderer.send(commands.openExternalGithub, "https://github.com/akirco/upscaler")
}

const toggleDark = () => {
  ipcRenderer.invoke("dark-mode:toggle")
}

</script>

<template>
  <TopBar title=""></TopBar>
  <MainContent>
    <div class="fixed top-10 w-56 text-right right-[10px] z-[9999]">
      <Menu as="div" class="relative inline-block text-left">
        <div>
          <MenuButton
            class="btn min-h-0 h-[35px] rounded-sm bg-menulightBg text-black hover:bg-gray-100 dark:bg-menuBg dark:hover:bg-slate-900 dark:text-white  shadow-sm border-none">
            Help
            <img class="ml-2 -mr-1 h-5 w-5 text-violet-200 hover:text-violet-100" :srcset="setting" draggable="false" />
          </MenuButton>
        </div>
        <transition enter-active-class="transition duration-100 ease-out" enter-from-class="transform scale-95 opacity-0"
          enter-to-class="transform scale-100 opacity-100" leave-active-class="transition duration-75 ease-in"
          leave-from-class="transform scale-100 opacity-100" leave-to-class="transform scale-95 opacity-0">
          <MenuItems
            class=" shadow-2xl absolute right-0 mt-2 w-56 origin-top-right  rounded bg-menulightBg  dark:bg-dropDownBg  ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div class="px-1 py-1">
              <MenuItem v-slot="{ active }">
              <button :class="[
                active ? 'bg-menuBg text-white' : 'text-gray-400',
                'group flex w-full items-center rounded px-2 py-2 text-sm',
              ]" @click.once="toggleMode" :disabled="commonState.menuDisabled">
                <div :active="active" class="mr-2 h-5 w-5 text-violet-400" aria-hidden="true">{{ checkedModeFlag }}</div>
                Toggle Mode
              </button>
              </MenuItem>
              <MenuItem v-slot="{ active }">
              <button :class="[
                active ? 'bg-menuBg text-white' : 'text-gray-400',
                'group flex w-full items-center rounded px-2 py-2 text-sm',
              ]" @click="toggleDark">
                <div :active="active" class="mr-2 h-5 w-5 text-violet-400" aria-hidden="true"></div>
                Toggle Theme
              </button>
              </MenuItem>
            </div>
            <div class="px-1 py-1">
              <MenuItem v-slot="{ active }">
              <button :class="[
                active ? 'bg-menuBg text-white' : 'text-gray-400',
                'group flex w-full items-center rounded px-2 py-2 text-sm',
              ]" @click="openExternalGithub">
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
      <div v-if="isSingleMode"
        class="w-full h-full col-span-2 bg-base-100  rounded-lg shadow-xl p-3 border-gray-300 dark:border-gray-700 border-2 border-dashed border-dark-50"
        ref="container">
        <TipBox content="文件处理失败，请稍后重试..." v-if="showInfo"
          class="fixed left-[12%] top-[12%] w-[400px] z-[9999] shadow-2xl" />
        <ImageViewer width="614" height="564" class="m-auto">
          <template #left>
            <img :src="inputFile" class="rounded-lg shadow-lg object-contain h-[100%] w-[96%]" draggable="false" />
          </template>
          <template #right>
            <img :src="outputFile" class="rounded-lg shadow-lg object-contain h-[100%] w-[96%]" draggable="false" />
          </template>
        </ImageViewer>
        <p class="fixed left-[48%] bottom-[48%]  text-indigo-800 dark:text-white font-semibold z-[9999] opacity-100">{{
          slotText.split("%")[0]
        }}</p>
      </div>
      <div v-if="!isSingleMode" class="w-full h-full col-span-2 bg-base-100  rounded-lg shadow-xl p-3">
        <div class="badge badge-primary badge-outline">Parallel Task count</div>
        <div class="divider mt-0 mb-0"></div>
        <div
          class="w-full col-span-2 bg-base-200 shadow p-3  inline-flex flex-row items-center justify-between gap-x-3 text-center">
          <div class="flex flex-col bg-neutral rounded text-neutral-content w-[100px] select-none">
            <span class="font-mono text-5xl">
              {{ parallelCount }}
            </span>
          </div>
          <div class="btn-group">
            <button class="btn btn-active" :disabled="parallelCount === 3" @click="plusParallel">Plus</button>
            <button class="btn" :disabled="parallelCount === 1" @click="subParallel">Subtract</button>
          </div>
        </div>
        <div class="badge badge-primary badge-outline">Task queue</div>
        <div class="divider mt-0 mb-0"></div>
        <div class="mt-3 h-[400px] overflow-y-scroll bg-base-200 shadow p-1">
          <table class="table w-full">
            <thead>
              <tr>
                <th>Task State</th>
                <th>Task Queue</th>
                <th>Task Progress</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in parallelTasks">
                <th>
                  <label>
                    <input type="checkbox" class="checkbox" :checked="taskCompleted" />
                  </label>
                </th>
                <td>
                  <div class="flex items-center space-x-3">
                    <div>
                      <div class="text-sm opacity-50">{{ item }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <progress class="progress progress-primary w-56"
                    :value="item === taskStatus.currentTask ? (taskCompleted ? 100 : taskStatus.progress) : 0"
                    max="100"></progress>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="h-full w-full flex justify-between flex-col">
        <div class="grid grid-rows-3 gap-5">
          <div>
            <div class="badge badge-primary badge-outline">upscaler</div>
            <div class="divider mt-0"></div>
            <div class="grid grid-rows-2 gap-3">
              <div class="flex gap-3">
                <input type="radio" name="radio-1" class="radio radio-primary" :value="upscaler.realesrgan"
                  v-model="picked as any" />
                <label for="radio-1">{{ upscaler.realesrgan }}</label>
              </div>
              <div class="flex gap-3">
                <input type="radio" name="radio-2" class="radio radio-primary" :value="upscaler.realsr
                " v-model="picked as any" />
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
            <div class="card-body items-center text-center gap-5" v-show="isSingleMode">
              <button :disabled="singleState.selectImageDisabled" class="btn btn-wide mt-3 btn-accent rounded"
                type="button" v-if="singleState.selectImageVisable" @click="selectInput">
                select image
              </button>
              <button class="btn btn-wide mt-3 btn-accent rounded" type="button" v-if="singleState.resetVisable"
                @click="singleModeReset">
                reset
              </button>
              <button class="btn btn-wide mt-3 rounded" type="button" @click="startEnhanced"
                :disabled="singleState.startDisabled" v-if="singleState.startVisable">
                start
              </button>
            </div>
            <div class="card-body items-center text-center gap-5" v-show="!isSingleMode">
              <button :disabled="parallelState.selectFolderDisabled" class="btn btn-wide mt-3 btn-accent rounded"
                type="button" v-if="parallelState.selectFolderVisable" @click="selectFolder">
                select Folder
              </button>
              <button class="btn btn-wide mt-3 btn-accent rounded" type="button" v-if="parallelState.resetVisable"
                :disabled="parallelState.resetDisabled" @click="parallelModeReset">
                reset
              </button>
              <button class="btn btn-wide mt-3 rounded" type="button" @click="startEnhanced"
                :disabled="parallelState.startDisabled" v-if="parallelState.startVisable">
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

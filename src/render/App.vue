<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { useLoading } from 'vue-loading-overlay'
import type { PluginApi, ActiveLoader } from "vue-loading-overlay"
import MainContent from "@/layout/main-content.vue";
import TopBar from "@/components/titleBar";
import ImageViewer from "@/components/imageViewer/ImageViewer.vue";
import empty from '@/assets/icons/empty.svg'
import { getOutputPath } from "@/utils/index"

import { channels } from "../libs/channels"
import { commands } from "../libs/commands";
const ipcRenderer = window.ipcRenderer


const upscaler = reactive({
  realesrgan: "realesrgan-ncnn-vulkan",
  realsr: "realsr-ncnn-vulkan"
})
const scale = ref(4);
const models = ref(["realesrgan-x4plus-anime", "realesrgan-x4plus", "ultrasharp", "ultramix_balanced"])

const picked = ref(upscaler.realesrgan)
const model = ref("realesrgan-x4plus-anime");
const disabled = ref(true)
const inputFile = ref(empty)
const outputFile = ref(empty);
const isSelected = ref(false)
const container = ref()
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
    "output": getOutputPath(inputFile.value.substring(10)),
  }

  ipcRenderer.send(channels.startEhanced, opts);
  loader = loading.show()
}

ipcRenderer.on(commands.upscale, (_, data) => {
  if (data.length > 0 && data.length < 10) {
    if (data === "0.00%") {
    }
    ipcRenderer.on(commands.done, () => {
      loader.hide()
      outputFile.value = "images:///" + getOutputPath(inputFile.value.substring(10));
    })
  }
})


const reset = () => {
  inputFile.value = empty
  outputFile.value = empty
  isSelected.value = false
  disabled.value = true
}

</script>

<template>
  <TopBar title=""></TopBar>
  <MainContent>
    <div class="grid grid-cols-3 gap-2 h-full w-full p-3">
      <div
        class="w-full h-full col-span-2 bg-base-100  rounded-lg shadow-xl p-3 border-gray-700 border-2 border-dashed border-dark-50"
        ref="container">
        <ImageViewer width="614" height="564" class="m-auto">
          <template #left>
            <img :src="inputFile" class="images" />
          </template>
          <template #right>
            <img :src="outputFile" class="images" />
          </template>
        </ImageViewer>
      </div>
      <div class="h-full w-full flex justify-between flex-col">
        <div class="grid grid-rows-3 gap-5">
          <div>
            <h3>upscler</h3>
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
            <h3>scale</h3>
            <div class="divider mt-0"></div>
            <input disabled="true" type="range" min="0" max="4" v-model="scale" class="range" step="1" />
            <div class="w-full flex justify-between text-xs px-2">
              <span>1</span>
              <span>2</span>
              <span>3</span>
              <span>4</span>
            </div>
          </div>
          <div>
            <h3>
              models
            </h3>
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

.images {
  object-fit: cover;
  width: 100%;
  height: 100%;
}
</style>

<template>
  <div class="PictureComparison" :style="'width:' + width + 'px;height:' + height + 'px'">
    <div class="before-image" :style="'width:' + x + 'px'" @click.stop="goLeft">
      <div :style="'width:' + width + 'px;height:' + height + 'px'">
        <slot name="left"></slot>
      </div>
    </div>
    <div class="after-image" @click.stop="goRight">
      <div :style="'width:' + width + 'px;height:' + height + 'px'">
        <slot name="right"></slot>
      </div>
    </div>
    <div class="divider-bar" :style="'left:' + x + 'px'" @mousedown.prevent="onmouseDown()"></div>
  </div>
</template>

<script lang="ts">
import { reactive, toRefs } from "vue";
export default {
  props: {
    width: { type: String, default: "614" },
    height: { type: String, default: "564" },
  },
  setup(props) {
    const data = reactive({
      isDown: false, //鼠标是否正按住
      moveX: 0, //鼠标移动的位置
      x: parseInt(props.width) / 2, //设置位置
    });
    const onmouseDown = () => {
      data.isDown = true;
      data.x = (event.target as any).offsetLeft;
      var disX = (event as any).clientX - (event.target as any).offsetLeft;
      document.onmousemove = function (event) {
        if (data.isDown == false) {
          return;
        }
        data.x = event.clientX - disX;
        if (data.x >= parseInt(props.width)) {
          data.x = parseInt(props.width);
        } else if (data.x <= 0) {
          data.x = 0;
        }
      };
      document.onmouseup = function () {
        data.isDown = false;
        document.onmousemove = document.onmouseup = null;
        return false;
      };
    };

    const goLeft = () => {
      data.x = 0;
    };
    const goRight = () => {
      data.x = parseInt(props.width);
    };
    return {
      ...toRefs(data),
      onmouseDown,
      goLeft,
      goRight,
    };
  },
};
</script>

<style scoped>
.PictureComparison {
  position: relative;
  display: inline-block;
  margin: 0 auto;
  min-height: 273px;
  /* margin-bottom: 40px; */
  overflow: hidden;
}

.PictureComparison .before-image {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 50%;
  overflow: hidden;
}

.PictureComparison .after-image {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
}

.PictureComparison .divider-bar {
  cursor: move;
  position: absolute;
  width: 2px;
  left: 50%;
  top: 0px;
  background: #374151;
  height: 100%;
  display: block;
  z-index: 2;
  box-shadow: 0 0 10px 1px rgba(0, 0, 0, 0.4);
}

.PictureComparison .divider-bar::after {
  content: "<|>";
  position: absolute;
  color: #ccc;
  text-align: center;
  line-height: 18px;
  width: 40px;
  height: 20px;
  background: #1e2226;
  border-radius: 8px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>

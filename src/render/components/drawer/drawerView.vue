<template>
    <div>

    </div>
</template>

<script lang="ts">
import { reactive, toRefs } from 'vue'

export default {
    setup() {
        const state = reactive({
            count: 0,
        })

        return {
            ...toRefs(state),
        }
    }
}
</script>

<style scoped>

</style>
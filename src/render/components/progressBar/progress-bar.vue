<template>
    <div class="progress" v-if="loading">
        <h1 class="lineUp" :style="messageStyle">{{ messages[messageIndex] }}</h1>
        <div class="outer" :style="outer">
            <div class="inner" id="inner" :style="inner" />
        </div>
    </div>
</template>

<script lang="ts">
const STATIC_VALUES = Object.freeze({
    HEIGHT: "7px",
    WIDTH: "60",
    BACKGROUNDCOLOR: "green",
    BORDERADIUS: "10px",
    LOADING: true,
    MESSAGES: ["Loading", "Hold on", "All set"],
    TEXTSIZE: "30px",
    TEXTCOLOR: "black",
    TEXTFONTFAMILY: "Avenir, Helvetica, Arial, sans-serif",
})

export default {
    name: "ProgressBar",
    components: {},
    data() {
        return {
            progress: 0,
            interval: null
        }
    },
    props: {
        duration: {
            type: Number,
            default: 5000
        },
        height: {
            type: String,
            default: STATIC_VALUES.HEIGHT,
        },
        width: {
            type: String,
            default: STATIC_VALUES.WIDTH,
        },
        backgroundColor: {
            type: String,
            default: STATIC_VALUES.BACKGROUNDCOLOR,
        },
        borderRadius: {
            type: String,
            default: STATIC_VALUES.BORDERADIUS,
        },
        loading: {
            type: Boolean,
            default: STATIC_VALUES.LOADING,
        },
        messages: {
            type: Array,
            default: STATIC_VALUES.MESSAGES
        },
        textSize: {
            type: String,
            default: STATIC_VALUES.TEXTSIZE,
        },
        textColor: {
            type: String,
            default: STATIC_VALUES.TEXTCOLOR,
        },
        textFontFamily: {
            type: String,
            default: STATIC_VALUES.TEXTFONTFAMILY,
        }
    },
    computed: {
        messages() {
            return this.messages;
        },
        messageIndex() {
            if (this.progress > this.messages.length - 1) {
                clearInterval(this.interval);
            }

            return Math.min(this.progress, this.messages.length - 1);
        },

        outer() {
            return {
                width: this.width + `%`,
                backgroundColor: `#cccccc`,
                height: this.height,
                borderRadius: this.borderRadius,
            };
        },
        inner() {
            return {
                width: `100%`,
                backgroundColor: this.backgroundColor,
                height: this.height,
                borderRadius: this.borderRadius,
                animation: `progress ${this.duration}ms ease-in 1`,
            };
        },
        messageStyle() {
            return {
                fontSize: this.textSize,
                fontFamily: this.textFontFamily,
                color: this.textColor,
                width: this.width + `%`,
            }
        }
    },
    mounted() {
        this.updateIndex(this.messages?.length);
    },
    methods: {
        updateIndex(length) {
            if (!length) {
                return this.progress = 0;
            }

            return this.interval = setInterval(() => {
                this.progress++;
            }, 2400)
        },
    },
};
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
}

.progress {
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: hidden;
    align-items: center;
    min-height: 100vh;
}

@keyframes progress {
    from {
        width: 0;
    }
}

.lineUp {
    display: flex;
    justify-content: center;
    animation: 2s anim-lineUp ease-out infinite;
}

@keyframes anim-lineUp {
    0% {
        opacity: 0;
        transform: translateY(80%);
    }

    20% {
        opacity: 0;
    }

    50% {
        opacity: 1;
        transform: translateY(0%);
    }

    100% {
        opacity: 0;
        transform: translateY(0%);
    }
}
</style>

<template>
    <div class="perspective-box" @touchstart="handleMouseDown" @mousedown="handleMouseDown" @touchmove="handleMouseMove"
        @mousemove="handleMouseMove" @touchend="handleMouseUp" @mouseup="handleMouseUp" @mouseleave="handleMouseLeave">
        <div class="paimon-box">
            <div class="paimon"></div>
        </div>
        <div class="artifact" v-for="(pos, slot) in artifactPos" @click="handleClickArtifactBox($event, slot)"
            :style="{ transform: `translate(-50%,-50%) translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px)` }">
            <img class="icon-default" v-if="artifacts.length === 0 || getSelectedArtifactInfo(slot).icon == ''"
                :draggable="false" :src="defaultIcons[slot]" alt="">
            <img class="icon-item" v-if="artifacts.length > 0 && getSelectedArtifactInfo(slot).icon !== ''"
                :draggable="false" :src="getSelectedArtifactInfo(slot).icon" alt="">
            <span class="bubble"></span>
            <span class="bubble"></span>
            <span class="bubble"></span>
            <span class="bubble"></span>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useGenshinStore } from '../../stores/genshin';
import { storeToRefs } from 'pinia';
const RAD = 300;
const { sin, cos, PI } = Math;
const THETA = PI * 2 / 5;
const MIN_SPEED = 0.004;
const SCROLL_SPEED = 0.4;
const MOUSEMOVE_INTERVAL_MS = 1000 / 20;
const FPS = 60;
const FRAME_TIME = 1000 / FPS;

const getPos = (t: number) => {
    const r = (window.innerWidth >= 1281) ? RAD : window.innerWidth * 0.35;
    return { x: r * cos(t), y: 0, z: r * sin(t) };
}

export default defineComponent({
    setup() {
        const store = useGenshinStore();
        const { artifacts } = storeToRefs(store);
        return { store, artifacts };
    },
    data() {
        return {
            defaultIcons: [
                '/img/artifact-flower.webp',
                '/img/artifact-plume.webp',
                '/img/artifact-hourglass.webp',
                '/img/artifact-goblet.webp',
                '/img/artifact-circlet.webp',
            ],
            artifactPos: [],
            t: 0,
            timer: null as NodeJS.Timer,
            speed: MIN_SPEED,
            mouse: {
                x: 0,
                y: 0,
                dragging: false
            },
            paused: false,
            direction: 1,
            lastTimeMoved: performance.now(),
            lastTimeRendered: null as number
        }
    },
    mounted() {
        this.startSpin();
    },
    beforeUnmount() { clearInterval(this.timer) },
    methods: {
        getSelectedArtifactInfo(slot: number) {
            if (!this.store.selectedArtifacts[slot]) return { icon: '', name: '' };
            const { tierIndex } = this.store.selectedArtifacts[slot];
            return {
                icon: this.artifacts[tierIndex].icons[slot],
                name: this.artifacts[tierIndex].title
            }
        },
        startSpin() {
            for (let i = 0; i < 5; i++) {
                this.artifactPos[i] = getPos((i + 1) * THETA);
            }
            requestAnimationFrame(this.spin);
        },
        spin(timestamp) {
            if (!this.lastTimeRendered) this.lastTimeRendered = performance.now();
            // Render 
            this.artifactPos = this.artifactPos.map((_, i) => getPos((i + 1) * THETA + this.t));
            if (!this.mouse.dragging) {
                this.t += this.direction * this.speed;
            }
            // Calculate frame time
            const timeElapsed = performance.now() - this.lastTimeRendered;
            // Reset time and render next frame
            this.lastTimeRendered = performance.now();
            if (timeElapsed < FRAME_TIME) {
                setTimeout(() => {
                    requestAnimationFrame(this.spin);
                }, FRAME_TIME - timeElapsed);
            } else {
                requestAnimationFrame(this.spin);
            }
        },
        handleClickArtifactBox(e: MouseEvent | TouchEvent, index: number) {
            e.stopPropagation();
            this.paused = true;
            this.store.setActiveIndex(index);
        },
        handleMouseDown(e: MouseEvent | TouchEvent) {
            const isMobile = window.TouchEvent && e instanceof TouchEvent;
            this.mouse.x = isMobile ? e.touches[0].clientX : (e as MouseEvent).clientX;
            this.mouse.y = isMobile ? e.touches[0].clientY : (e as MouseEvent).clientY;
            this.mouse.dragging = true;
        },
        handleMouseMove(e: MouseEvent | TouchEvent) {
            if (!this.mouse.dragging) return;
            if (performance.now() - this.lastTimeMoved < MOUSEMOVE_INTERVAL_MS) return;
            const { x: lastX, y: lastY } = this.mouse;
            const isMobile = window.TouchEvent && e instanceof TouchEvent;
            this.mouse.x = isMobile ? e.touches[0].clientX : (e as MouseEvent).clientX;
            this.mouse.y = isMobile ? e.touches[0].clientY : (e as MouseEvent).clientY;
            this.direction = lastX < this.mouse.x ? -1 : 1;
            this.t += (this.direction) * (window.innerWidth < 1281 ? 1.2 * SCROLL_SPEED : SCROLL_SPEED);
            this.lastTimeMoved = performance.now();
        },
        handleMouseUp(e: MouseEvent | TouchEvent) {
            if (!this.mouse.dragging) return;
            this.mouse.dragging = false;
        },
        handleMouseLeave(e: MouseEvent) {
            this.mouse.dragging = false;
        }
    },
    $watch: {
        artifacts: function (newVal, oldVal) {

        }
    }
})
</script>

<style lang="scss" scoped>
@import '../../styles/anim.scss';
$H: 25vh;
$R: 1.2;
$gold: rgba(255, 255, 200, 0.8);
$glow-norm: drop-shadow(0 0 5px rgba(255, 255, 200, 0.8));
$glow-intense: drop-shadow(0 0 8px rgba(255, 255, 200, 0.8));

// paimon glow
@keyframes paimon-glow {
    0% {
        -webkit-filter: $glow-norm;
        filter: $glow-norm;
    }

    50% {
        -webkit-filter: $glow-intense;
        filter: $glow-intense;
    }

    100% {
        -webkit-filter: $glow-norm;
        filter: $glow-norm;
    }
}

// Paimon drop
@keyframes paimon-drop {
    0% {
        opacity: 0;
        transform: scale(0.1) translateY(-1000%);
        filter: drop-shadow(0 -50px 30px rgba(255, 255, 200, 0.9));
    }

    40% {
        opacity: 0.8;
        transform: scale(0.9) translateY(-50%);
        filter: drop-shadow(0 -50px 30px rgba(255, 255, 200, 0.9));
    }

    60% {
        opacity: 0.8;
        transform: scale(0.9) translateY(-20%);
        filter: drop-shadow(0 -50px 30px rgba(255, 255, 200, 0.9));
    }

    100% {
        opacity: 1;
        transform: scale(1) translateY(0);
        filter: drop-shadow(0 0 20px rgba(255, 255, 200, 1));
    }
}

.perspective-box {
    position: relative;
    width: 100%;
    height: $H;
    display: flex;
    justify-content: center;
    align-items: center;
    perspective: 1000px;
    perspective-origin: center top;
    overflow: visible;
    transform-style: preserve-3d;
    user-select: none;

    .paimon-box {
        z-index: 9;
        display: flex;
        justify-content: center;
        align-items: center;

        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) translate3d(0, 0, 0);

        .paimon {
            width: 100%;
            height: 100%;
            background-image: url(/img/paimon.gif);
            background-size: cover;
            background-repeat: no-repeat;
        }
    }


    .artifact {
        z-index: 9;

        position: absolute;
        top: 50%;
        left: 50%;

        display: flex;
        justify-content: center;
        align-items: center;
        color: #fff;
        background-position: center center;
        background-repeat: no-repeat;
        background-size: cover;
        transition: all 0.05s linear;
        -webkit-transition: all 0.05s linear;
        overflow: hidden;

        img {
            z-index: 8;
        }

        img.icon-item {
            width: 100%;
            height: 100%;
        }

        img.icon-default {
            width: 40%;
            height: 40%;
            filter: contrast(99) invert(1);
            -webkit-filter: contrast(99) invert(1);
            opacity: 0.3;
        }

        // Bubble
        border-radius: 50%;
        box-shadow: 0 0 10px $gold inset,
        0 0 10px $gold;


        // Glow
        &::before {
            content: '';
            position: absolute;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background-color: rgba(255, 255, 180, 1);
            top: 14%;
            left: 14%;
            z-index: 10;
            filter: blur(2px);
        }

        span {
            position: absolute;
            border-radius: 50%;
        }

        span:nth-child(1) {
            inset: 3px;
            border-left: 6px solid rgba(200, 200, 255, 0.67);
            filter: blur(3px);
        }

        span:nth-child(2) {
            inset: 4px;
            border-right: 2px solid rgba(255, 255, 255, 0.4);
            filter: blur(3px);
        }

        span:nth-child(3) {
            inset: 4px;
            border-top: 2px solid rgba(255, 200, 100, 0.4);
            filter: blur(3px);
        }

        span:nth-child(4) {
            inset: 4px;
            border-bottom: 2px solid rgba(200, 255, 100, 0.4);
            filter: blur(3px);
        }
    }
}

// PC Effect
@media screen and (min-width: 1281px) {
    .paimon {
        animation: paimon-glow 5s infinite linear alternate, paimon-drop 1s ease-out;
    }

    .artifact:hover {
        box-shadow: 0 0 1rem $gold inset, 0 0 1rem $gold;
    }
}

// PC
@media screen and (min-width: 1281px) {
    .paimon-box {
        height: calc($R * 465px);
        width: calc($R * 397px);
    }

    .artifact {
        width: 100px;
        height: 100px;
    }
}

// Mobile
@media screen and (max-width: 1281px) {
    .paimon-box {
        height: calc(4.65 * 10vw) !important;
        width: calc(3.97 * 10vw) !important;
    }

    .artifact {
        width: 15vw;
        height: 15vw;
    }
}
</style>
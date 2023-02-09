<template>
    <div class="canvas-container">
        <canvas id="canvas"></canvas>
        <div v-if="loadingProgress" class="loading-status">
            {{ loadingProgress }}
        </div>
    </div>
    <!-- 左侧弹出 -->
    <van-popup
        v-model:show="showDrawer"
        position="left"
        :style="{ width: '40%', height: '100%' }"
        :overlay-style="{ zIndex: 'var(--van-overlay-z-index);', background: 'transparent' }"
        :closeable="false"
    >
    <van-collapse v-model="activeNames">
        <van-collapse-item title="显示" name="display">
            <div class="drawer__block">
                <h1 class="drawer__title">缩放</h1>
                <van-slider v-model="modelScale" :min="0.01" :max="3" :step="0.01" active-color="var(--theme-color)" />
            </div>
            <div>
                <van-field name="switchHitArea" label="显示点击区域">
                    <template #input>
                        <van-switch v-model="showHitArea" />
                    </template>
                </van-field>
            </div>
            <div>
                <van-field name="switchModelArea" label="显示模型区域">
                    <template #input>
                        <van-switch v-model="showModelArea" />
                    </template>
                </van-field>
            </div>
        </van-collapse-item>
        <van-collapse-item title="动作" name="motions">
            <div class="list-group">
                <div class="list-group-item">
                    <div class="motion-progress"></div>
                    <div class="list-group-item__content">
                        action/idle
                    </div>
                    <div class="list-group-item__icon">
                        <van-icon name="play" size="18" />
                    </div>
                </div>
            </div>
        </van-collapse-item>
        <van-collapse-item title="表情" name="expressions">
            在代码阅读过程中人们说脏话的频率是衡量代码质量的唯一标准。
        </van-collapse-item>
        </van-collapse>
    </van-popup>
    <Live2dSettingButton @click="showDrawer = !showDrawer" />

</template>

<script setup lang="ts">
import { onMounted, ref, computed, onBeforeUnmount, Ref, watch } from 'vue';
import { Application, Ticker, Container, Point } from 'pixi.js';
import { Live2DModel } from '../../framework/live2d/Live2DModel';
import Live2dSettingButton from './Live2dSettingButton.vue';
import { ModelEntity } from '../../framework/live2d/ModelEntity';
import { MotionPriority, MotionState } from 'pixi-live2d-display';

const showDrawer = ref(false);
const showHitArea = ref(false);
const showModelArea = ref(false);
const activeNames = ref(['display']);
const modelScale = ref(0.01);
const progress = ref(0.5);
const modelVisible = ref(false);
const motionExpand = ref(false);
const motionState: Ref<MotionState | undefined> = ref();
const loadingProgress = ref('');

let model: ModelEntity | undefined = undefined;

let motionProgressTimerID = 0;

const progressCssVar = computed(() => {
    return `${progress.value * 100}%`;
});


Live2DModel.registerTicker(Ticker);

let container: Container;
let app: Application;

const updateMotionProgress = () => {
    if (!(model?.pixiModel && motionState.value?.currentGroup !== undefined && motionExpand && modelVisible.value)) {
        return;
    }
    const startTime = model.pixiModel.currentMotionStartTime;
    const duration = model.pixiModel.currentMotionDuration;
    progress.value = Math.min(1, Math.max(0, (model.pixiModel.elapsedTime - startTime) / duration));
}

const addModel = (source: string) => {
    model = new ModelEntity(source);
    initModel(model);
}

const initModel = (model: ModelEntity) => {
    model.on('modelLoaded', (pixiModel: Live2DModel) => {
        if (!container.children.includes(pixiModel)) {
            container.addChild(pixiModel);

            // pixiModel.backgroundVisible = showModelArea.value;
            // pixiModel.hitAreaFrames.visible = showHitArea.value;
            pixiModel.x = 0;
            pixiModel.y = 300;
            pixiModel.anchor.set(0.5, 0.5);
            modelScale.value = 0.45;
        }
        loadingProgress.value = '';
    });
    model.on('loadingProgress', (progress: string) => {
        loadingProgress.value = progress;
    })
}

watch(showModelArea, () => {
    if (model && model.pixiModel) {
        model.pixiModel.backgroundVisible = showModelArea.value;
    }
});

watch(showHitArea, () => {
    if (model && model.pixiModel) {
        model.pixiModel.hitAreaFrames.visible = showHitArea.value;
    }
});

watch(modelScale, () => {
    if (model && model.pixiModel) {
        model.scaleX = modelScale.value;
    }
});

onMounted(async () => {
    const designSize = { w: 1920, h: 1080 };
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (canvas) {
        app = new Application({
            resizeTo: canvas,
            view: canvas,
            antialias: true, // default:false 开启抗锯齿
            transparent: true, // 是否开启透明通道
            backgroundColor: 0x000000
        });
        container = new Container();
        app.stage.addChild(container);
        // const model = await Live2DModel.from('/assets/live2d/kurisu/kurisu.model.json');
        // const model = await Live2DModel.from('/assets/live2d/Hiyori/hiyori.model3.json');
        // const modelScale = 0.45;
        // model.x = 0;
        // model.y = 300;
        // model.scale.set(modelScale, modelScale);
        // model.anchor.set(0.5, 0.5);
        // container.addChild(model);

        const resize = () => {
            const wViewPort = app.screen.width;
            const hViewPort = app.screen.height;
            const rViewPort = wViewPort / hViewPort;
            const rImage = designSize.w / designSize.h;
            let scale = 1;
            if (rImage < rViewPort) {
                scale = wViewPort / designSize.w;
            } else {
                scale = hViewPort / designSize.h;
            }
            container.scale = new Point(scale, scale);
            container.x = wViewPort / 2;
            container.y = hViewPort / 2;
            app.render();
        };

        app.renderer.on('resize', () => {
            resize();
        });

        resize();

        addModel('/assets/live2d/Hiyori/hiyori.model3.json');
    }
    motionProgressTimerID = window.setInterval(updateMotionProgress, 50);
});

onBeforeUnmount(() => {
    clearInterval(motionProgressTimerID);
});
</script>

<style lang="scss" scoped>
.canvas-container {
    display: flex;
    position: relative;
    width: 80%;
    height: 0;
    padding-bottom: 100%;
    margin: 0 auto;
}
#canvas {
    position: absolute;
    margin: 0 auto;
    width: 100%;
    height: 100%;
}

.drawer__block {
    padding: 0 var(--van-padding-md) 20px
}
.drawer__title {
    font-weight: 400;
    font-size: 16px;
    line-height: 16px;
    text-align: left;
    margin: 0;
    padding: 20px 0px;
}

.list-group-item {
    display: flex;
    flex-direction: row;
    align-items: center;
    text-align: left;
    cursor: pointer;
    padding: 10px 0px;
    position: relative;
    .list-group-item__content {
        flex: 1 1 !important;
    }
    .list-group-item__icon {
        min-width: 40px;
        margin: 0 auto;
        text-align: center;
    }
}

.motion-progress {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    opacity: .24;
    background: linear-gradient(var(--theme-color), var(--theme-color)) no-repeat;
    background-size: v-bind("progressCssVar") auto;
}

.loading-status {
    position: absolute;
    left: 0;
    bottom: 0;
    white-space: break-spaces;
    text-align: left;
}
</style>
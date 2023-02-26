<template>
    <!-- 左侧弹出 -->
    <van-popup
        v-model:show="showDrawerValue"
        position="left"
        :style="{ width: '40%', height: '100%' }"
        :closeable="true"
        :overlay="false"
        close-icon-position="top-left"
    >
    <van-collapse v-model="uiState.activeNames">
        <van-collapse-item title="显示" name="display">
            <div class="drawer__block">
                <h2 class="drawer__title">缩放</h2>
                <van-slider v-model="uiState.modelScale" :min="0.01" :max="3" :step="0.01" active-color="var(--theme-color)" />
            </div>
            <div>
                <van-field name="switchHitArea" label="显示点击区域">
                    <template #input>
                        <van-switch v-model="uiState.showHitArea" active-color="var(--theme-color)" />
                    </template>
                </van-field>
            </div>
            <div>
                <van-field name="switchModelArea" label="显示模型区域">
                    <template #input>
                        <van-switch v-model="uiState.showModelArea" active-color="var(--theme-color)" />
                    </template>
                </van-field>
            </div>
        </van-collapse-item>
        <van-collapse-item title="动作" name="motions">
            <div  class="list-group" v-for="motionGroup in motionGroupsRef" :key="motionGroup.name">
                <h2 class="drawer__title">{{ motionGroup.name || 'Nameless' }}</h2>
                <div v-for="(motion,i) in motionGroup.motions" :key="motionGroup.name+i" 
                    class="list-group-item" 
                    @click="startMotion(motionGroup,i)"
                    :data-set="active=motionState?.currentGroup===motionGroup.name&&motionState.currentIndex===i"
                    >
                    <div v-if="active" class="motion-progress"></div>
                    <div class="list-group-item__content" :class="{'primary--text':active}">
                        {{ motion.file.replace('.mtn', '').replace('.motion3.json', '') }}
                    </div>
                    <div class="list-group-item__icon">
                        <van-icon  v-if="active" name="play" size="18" />
                        <van-loading v-else-if="(motionState?.reservedGroup===motionGroup.name&&motionState.reservedIndex===i)
                    ||(motionState?.reservedIdleGroup===motionGroup.name&&motionState.reservedIdleIndex===i)" />
                    </div>
                </div>
            </div>
        </van-collapse-item>
        <van-collapse-item title="表情" name="expressions">
            <div class="list-group-item" 
            v-for="(expression,i) in expressionsRef" 
            :key="i" :data-set="active=currentExpressionIndex===i"
            @click="setExpression(i)"
            >
                <div class="list-group-item__content" :class="{'primary--text':active}" >
                    {{ expression.file.replace('.exp.json', '').replace('.exp3.json', '') }}
                </div>
                <div class="list-group-item__icon">
                    <van-icon  v-if="active" name="smile-o" size="18" :class="{'primary--text':active}" />
                    <van-loading v-else-if="pendingExpressionIndex===i" />
                </div>
            </div>
        </van-collapse-item>
        </van-collapse>
    </van-popup>
</template>

<script setup lang="ts">
import { onMounted, ref, computed, onBeforeUnmount, Ref, watch, reactive, defineProps } from 'vue';
import { MotionPriority, MotionState } from '../../libs/live2d/src';
import { Live2DModel } from '../../framework/live2d/Live2DModel';
import { ModelEntity } from '../../framework/live2d/ModelEntity';

const props = defineProps({
    model: ModelEntity,
    showDrawer: Boolean,
});

const emit = defineEmits(['update:showDrawer']);

const showDrawerValue = computed({
    get() {
        return props.showDrawer;
    },
    set(val: boolean) {
        emit('update:showDrawer', val);
    }
});

interface MotionGroupEntry {
    name: string
    motions: {
        file: string;
        error?: any;
    }[]
}

interface ExpressionEntry {
    file: string;
    error?: any;
}

let motionProgressTimerID = 0;

const uiState = reactive({
    showHitArea: false,
    showModelArea: false,
    activeNames: ['display'],
    progress: 0,
    modelScale: 0.01,
});

const motionState: Ref<MotionState | undefined> = ref();
const motionGroupsRef: Ref<MotionGroupEntry[]> = ref([]);
const expressionsRef: Ref<ExpressionEntry[]> = ref([]);
const currentExpressionIndex = ref(-1);
const pendingExpressionIndex = ref(-1);

const progressCssVar = computed(() => {
    return `${uiState.progress * 100}%`;
});

const pixiModelLoaded = (pixiModel: Live2DModel) => {
    const motionManager = pixiModel.internalModel.motionManager;
    const motionGroups: MotionGroupEntry[] = [];
    const definitions = motionManager.definitions;
    for (const [group, motions] of Object.entries(definitions)) {
        motionGroups.push({
            name: group,
            motions: motions?.map((motion, index) => ({
                file: motion.file || motion.File || '',
                error: motionManager.motionGroups[group]![index]! === null ? 'Failed to load' : undefined,
            })) || [],
        });
    }
    motionGroupsRef.value = motionGroups;
    motionState.value = motionManager.state;
    const expressionManager = motionManager.expressionManager;
    expressionsRef.value = expressionManager?.definitions.map((expression, index) => ({
        file: expression.file || expression.File || '',
        error: expressionManager!.expressions[index]! === null ? 'Failed to load' : undefined,
    })) || [];
    currentExpressionIndex.value = expressionManager?.expressions.indexOf(expressionManager!.currentExpression) ?? -1;
    pendingExpressionIndex.value = expressionManager?.reserveExpressionIndex ?? -1;
    pixiModel.on('expressionSet', expressionSet);
    pixiModel.on('expressionReserved', expressionReserved);
    motionManager.on('motionLoadError', motionLoadError);
    expressionManager?.on('expressionLoadError', expressionLoadError);
    uiState.modelScale = pixiModel.scale.x;
}

const expressionSet = (index: number) => {
    currentExpressionIndex.value = index;
};
const expressionReserved = (index: number) => {
    pendingExpressionIndex.value = index;
};
const motionLoadError = (group: string, index: number, error: any) => {
    const motionGroup = motionGroupsRef.value.find(motionGroup => motionGroup.name === group);
    if (motionGroup) {
        motionGroup.motions[index]!.error = error;
    }
};
const expressionLoadError = (index: number, error: any) => {
    expressionsRef.value![index]!.error = error;
};

const startMotion = (motionGroup: MotionGroupEntry, index: number) => {
    props.model?.pixiModel?.motion(motionGroup.name, index, MotionPriority.FORCE);
}

const setExpression = (index: number) => {
    props.model?.pixiModel?.expression(index);
};

const updateMotionProgress = () => {
    if (!(props.model?.pixiModel && motionState.value?.currentGroup !== undefined && showDrawerValue.value && uiState.activeNames.find((active) => active === 'motions'))) {
        return;
    }
    motionState.value = Object.assign({},   props.model.pixiModel.internalModel.motionManager.state);
    const startTime = props.model.pixiModel.currentMotionStartTime;
    const duration = props.model.pixiModel.currentMotionDuration;
    uiState.progress = Math.min(1, Math.max(0, (props.model.pixiModel.elapsedTime - startTime) / duration));
}

const watchModel = () => {
    if (!props.model) {
        return;
    }
    if (props.model.isModelLoaded && props.model.pixiModel) {
        pixiModelLoaded(props.model.pixiModel);
    } else {
        props.model.on('modelLoaded', (pixiModel: Live2DModel) => {
        pixiModelLoaded(pixiModel);
    });
    }
}

watch(() => uiState.showModelArea, () => {
    if (props.model?.pixiModel) {
        props.model.pixiModel.backgroundVisible = uiState.showModelArea;
    }
});

watch(() => uiState.showHitArea, () => {
    if (props.model?.pixiModel) {
        props.model.pixiModel.hitAreaFrames.visible = uiState.showHitArea;
    }
});

watch(() => uiState.modelScale, () => {
    if (props.model?.pixiModel) {
        props.model.scaleX = uiState.modelScale;
    }
});

watch(() => props.model, () => {
    console.log('props model change', props.model?.isModelLoaded);
    watchModel();
});

onMounted(async () => {
    watchModel();
    motionProgressTimerID = window.setInterval(updateMotionProgress, 50);
});

onBeforeUnmount(() => {
    clearInterval(motionProgressTimerID);
});
</script>

<style lang="scss" scoped>
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
    background-size: v-bind("progressCssVar") 100%;
}

.primary--text {
    color: var(--theme-color);
}
</style>
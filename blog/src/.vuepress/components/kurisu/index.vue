<template>
    <div class="canvas-container">
        <canvas id="canvas"></canvas>
        <div v-if="uiState.loadingProgress" class="loading-status" :class="{ 'error-tips' : uiState.loadingProgress.indexOf('error') >= 0 }">
            {{ uiState.loadingProgress }}
        </div>
        <div class="chat-input" :class="{ 'sedding' : uiState.sending }">
            <van-loading class="loading" v-if="uiState.sending" />
            <input :disabled="uiState.sending" type="text" placeholder="请输入..." :value="inputValue"/>
            <van-icon class="send-btn" name="chat" size="30px" color="currentColor" @click="onSend" />
        </div>
    </div>
    <Live2dDebuggerEditor v-model:show-drawer="uiState.showDrawer" :model="model" />
    <Live2dSettingButton @click="uiState.showDrawer = !uiState.showDrawer" />

</template>

<script setup lang="ts">
import { onMounted, ref, Ref, reactive } from 'vue';
import App from './App';
import { Live2DModel } from '../../framework/live2d/Live2DModel';
import Live2dSettingButton from './Live2dSettingButton.vue';
import { ModelEntity } from '../../framework/live2d/ModelEntity';
import { Kurisu } from './KurisuModel';
import Live2dDebuggerEditor from './Live2dDebuggerEditor.vue';

const apiDomain = 'https://19hevguuz2.execute-api.ap-northeast-1.amazonaws.com/Prod';
const API = {
    chat: `${apiDomain}/kurisu/chat`
}


const uiState = reactive({
    showDrawer: false,
    loadingProgress: '',
    sending: false,
});

const inputValue = ref('今日はいい天気ですね。');

const model: Ref<ModelEntity | undefined> = ref();

let app: App;

const initModel = async () => {
    model.value = new Kurisu();
    watchModel(model.value);
}

const watchModel = (model: ModelEntity) => {
    model.on('modelLoaded', (pixiModel: Live2DModel) => {
        if (!app?.container.children.includes(pixiModel)) {
            app?.container.addChild(pixiModel);
            pixiModel.x = 0;
            pixiModel.y = 300;
            pixiModel.anchor.set(0.5, 0.5);
            model.scaleX = 0.45;
        }
        uiState.loadingProgress = '';
    });
    model.on('loadingProgress', (progress: string) => {
        uiState.loadingProgress = progress;
    });
    model.on('modelLoadedError', (e: any) => {
        uiState.loadingProgress = e.message || ''
    });
}

const onSend = async () => {
    uiState.sending = true;
    try {
        await fetchChat({
            text: '今日はいい天気ですね。'
        });
        inputValue.value = '';
    } finally {
        uiState.sending = false;
    }
}

// 请求解密图片
const fetchChat = async ({ text } : {text: string}) => {
    const param = {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
            text,
        }) // body data type must match "Content-Type" header
    };
    const res = await fetch(API.chat, param);
    return res.json();
}


const initApp = () => {
    app = new App('canvas');
    app.loadBg();
}

onMounted(async () => {
    initApp();
    initModel();
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

    .chat-input {
        position: absolute;
        width: 100%;
        height: 50px;
        background: #ffffffb5;
        bottom: 0;
        border-radius: 10px 10px 0px 0px;
        display: flex;
        flex-direction: row;
        align-items: center;

        input {
            flex-grow: 1;
            margin-left: 20px;
            margin-right: 20px;
            color: currentColor;
            border: none;
            height: 70%;
            background: none;
        }

        .send-btn {
            margin-right: 10px;
            cursor: pointer;
        }

        .loading {
            position: absolute;
            margin-left: 15px;
            color: crimson;
        }
    }

    .chat-input.sedding {
        input {
            color: darkgrey;
        }
    }
}
#canvas {
    position: absolute;
    margin: 0 auto;
    width: 100%;
    height: 100%;
}

.loading-status {
    position: absolute;
    left: 0;
    bottom: 0;
    white-space: break-spaces;
    text-align: left;
}

.error-tips {
    color: red;
}
</style>
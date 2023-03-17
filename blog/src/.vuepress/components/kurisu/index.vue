<template>
    <div class="canvas-container">
        <canvas id="canvas"></canvas>
        <div v-if="uiState.loadingProgress" class="loading-status" :class="{ 'error-tips' : uiState.loadingProgress.indexOf('error') >= 0 }">
            {{ uiState.loadingProgress }}
        </div>
        <div v-if="uiState.chatContentHeight" class="chat-panel-mask" @click="onMaskClick"></div>
        <div class="chat-panel">
            <van-icon v-if="chatContents.length" class="message" size="30px" name="chat" :badge="chatContents.length" @click="onRead" />
            <div class="chat-content" :style="{ height: `${uiState.chatContentHeight}px` }">
                <div class="p">
                    <VueWriter v-if="uiState.chatContentHeight" :typeSpeed="70" :iterations='1' :array="uiState.text" />
                </div>
            </div>
        </div>
        <div v-if="!uiState.loadingProgress" class="chat-input" :class="{ 'sedding' : uiState.sending }">
            <van-loading class="loading" v-if="uiState.sending" />
            <input :disabled="uiState.sending" type="text" placeholder="..." v-model="inputValue"/>
            <van-icon class="send-btn" name="share" size="30px" @click="onSend" />
        </div>
    </div>
    <Live2dDebuggerEditor v-model:show-drawer="uiState.showDrawer" :model="model" />
    <Live2dSettingButton @click="uiState.showDrawer = !uiState.showDrawer" />

</template>

<script setup lang="ts">
import { onMounted, ref, Ref, reactive } from 'vue';
import VueWriter from '../common/vue-writer.vue'
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
    chatContentHeight: 0,
    text: ['...']
});

const inputValue = ref('今日はいい天気ですね。');

const model: Ref<ModelEntity | undefined> = ref();
    
const chatContents: Ref<{ audio: string, text: string}[]> = ref([]);

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

const onRead = () => {
    if (chatContents.value.length) {
        const chatContent = chatContents.value.shift();
        uiState.chatContentHeight = 100;
        if (chatContent) {
            model.value?.pixiModel?.motion('Idle', 0, undefined, chatContent.audio);
            uiState.text = [chatContent.text];
        }
    }
} 

const onSend = async () => {
    if (!inputValue.value.trim()) {
        return;
    }
    uiState.sending = true;
    try {
        const res = await fetchChat({
            text: inputValue.value.trim()
        });
        // inputValue.value = '';
        chatContents.value.push({ audio: res.Data.audio, text: res.Data.text } );
        // model.value?.pixiModel?.motion('Idle', 0, undefined, res.Data.audio);
    } finally {
        uiState.sending = false;
    }
}

const onMaskClick = () => {
    uiState.chatContentHeight = 0;
}

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

    .chat-panel-mask {
        position: absolute;
        width: 100%;
        height: 100%;
    }

    .chat-panel {
        position: absolute;
        width: 100%;
        bottom: 0;
    }

    .chat-content {
        width: 100%;
        height: 100px;
        padding-bottom: 50px;
        bottom: 0px;
        background: aliceblue;
        border-radius: 10px 10px 0px 0px;
        opacity: 0.7;
        transition: 0.2s;
        color: #2c3e50;
        overflow: hidden;

        .p{
            position: relative;
            padding: 10px;
            text-align: left;
            overflow-y: scroll;
            height: 70px;
        }

        .p::-webkit-scrollbar-thumb {
            background: #b8cde2;
        }
    }

    .message {
        color: white; 
        font-size: 30px;
        position: absolute;
        top: -35px;
        left: 20px;
        cursor: pointer;
    }

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
            color: #2c3e50;
            border: none;
            height: 70%;
            background: none;
            padding-left: 10px;
        }

        .send-btn {
            padding-right: 10px;
            cursor: pointer;
            color: #2c3e50;
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
        .send-btn {
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
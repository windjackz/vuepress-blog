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
                    <VueWriter v-if="uiState.chatContentHeight" :typeSpeed="150" :iterations='1' :array="uiState.text" />
                </div>
            </div>
        </div>
        <div v-if="!uiState.loadingProgress" class="chat-input" :class="{ 'sedding' : uiState.sending }">
            <van-loading class="loading" v-if="uiState.sending" />
            <input :disabled="uiState.sending" type="text" placeholder="..." v-model="inputValue" maxlength="30"/>
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
import { motionGroupsRef } from './datas';
import { MotionPriority } from 'pixi-live2d-display';
import { showNotify } from 'vant';

interface ChatResponse {
    audio: string;
    commands: Array<{
        commands: { action: string; }
    }>;
    emotions: {
        emotions: {
            "喜悦": string;
            "愤怒": string;
            "傲娇": string;
            "悲伤": string;
        }
    };
    text: string;
}

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
    
const chatContents: Ref<ChatResponse[]> = ref([]);

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

const parseEmotion = (chatContent: ChatResponse) => {
    if (chatContent.emotions) {
        let emotionKey = '';
        const sortedEmotion = [{
            param: [{
                key: 'm09',
                value: 5,
            }],
            value: Number(chatContent.emotions.emotions.傲娇.charAt(0)) || 0
        },
        {
            param: [{
                key: 'm01',
                value: 3,
            },
            {
                key: 'm06',
                value: 5,
            }],
            value: Number(chatContent.emotions.emotions.喜悦.charAt(0)) || 0
        },
        {
            param: [{
                key: 'm10',
                value: 5,
            }],
            value: Number(chatContent.emotions.emotions.悲伤.charAt(0)) || 0
        },
        {
            param: [{
                key: 'm04',
                value: 5,
            }],
            value: Number(chatContent.emotions.emotions.愤怒.charAt(0)) || 0
        }
        ];
        sortedEmotion.sort((a, b) => (b.value - a.value));
        const emotions = sortedEmotion[0];
        emotionKey = emotions.param[0].key;
        if (emotions.param.length > 1) {
            emotionKey = emotions.param.find((item) => item.value >= emotions.value)?.key || '';
        }
        // 找出key对应的index
        const group = motionGroupsRef.value.find((item) => item.name === 'Idle');
        if (group) {
            return group.motions.findIndex((item) => item.file.lastIndexOf(emotionKey) >= 0);
        }
    }
    return 0;
}

const handleCommands = (chatContent: ChatResponse) => {
    chatContent.commands.forEach((item) => {
        switch (item.commands.action) {
            case 'backToHome':
                setTimeout(() => {
                    window.location.href = '/';
                }, 5000);
                break;
            case 'openDebuggerPanel':
                setTimeout(() => {
                    uiState.showDrawer = true;
                }, 3000);
                break;

        }
    });
}

const onRead = () => {
    if (chatContents.value.length) {
        const chatContent = chatContents.value.shift();
        uiState.chatContentHeight = 100;
        if (chatContent) {
            // 解析情绪
            let motionIndex = parseEmotion(chatContent);
            motionIndex = Math.max(0, motionIndex);
            // m05 高兴  m09 傲娇 m10 悲伤 m04 愤怒
            model.value?.pixiModel?.motion('Idle', motionIndex, MotionPriority.FORCE, chatContent.audio);
            uiState.text = [chatContent.text];
            // 处理动作
            handleCommands(chatContent);
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
        chatContents.value.push(Object.assign({}, res.Data));
        // model.value?.pixiModel?.motion('Idle', 0, undefined, res.Data.audio);
    } catch (err) {
        showNotify({
            type: 'warning',
            message: err.message,
        });
    }
    finally {
        uiState.sending = false;
    }
}

const onMaskClick = () => {
    uiState.chatContentHeight = 0;
}

const fetchChat = async ({ text }: { text: string }): Promise<{
    Data: ChatResponse
}> => {
    const param = {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
            text: [{
                role: 'user',
                content: text,
            }],
        }) // body data type must match "Content-Type" header
    };
    const res = await fetch(API.chat, param);
    const resObj = await res.json();
    if (resObj.Data?.emotions) {
        resObj.Data.emotions = JSON.parse(resObj.Data.emotions);
    }
    if (resObj.Data?.commands?.length) {
        resObj.Data.commands = resObj.Data.commands.map((item => JSON.parse(item)));
    }
    return resObj;
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
    /* display: flex;
    position: fixed;
    width: 100vw;
    height: 100vh;
    padding-bottom: 100%;
    margin: 0 auto; */
    display: flex;
    position: fixed;
    width: 100vw;
    height: 100vh;
    // padding-bottom: 100%;
    margin: 0 auto;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 200;

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
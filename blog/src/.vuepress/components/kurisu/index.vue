<template>
    <div class="canvas-container">
        <canvas id="canvas"></canvas>
        <div v-if="uiState.loadingProgress" class="loading-status" :class="{ 'error-tips' : uiState.loadingProgress.indexOf('error') >= 0 }">
            {{ uiState.loadingProgress }}
        </div>
        <div v-if="uiState.chatContentHeight" class="chat-panel-mask" @click="onMaskClick"></div>
        <div class="chat-panel" v-if="!uiState.loadingProgress">
            <van-icon v-if="chatContents.length" class="message" size="30px" name="chat" :badge="chatContents.length" @click="onRead" />
            <div class="chat-content" :style="{ height: `${uiState.chatContentHeight}px` }">
                <div class="p">
                    <VueWriter v-if="uiState.chatContentHeight" :typeSpeed="150" :iterations='1' :array="uiState.text" />
                </div>
            </div>
        </div>
        <div v-if="!uiState.loadingProgress" class="chat-input" :class="{ 'sedding' : uiState.sending, 'disabled': !!chatContents.length }">
            <van-loading class="loading" v-if="uiState.sending" />
            <input :disabled="uiState.sending || !!chatContents.length" type="text" placeholder="..." v-model="inputValue" maxlength="30"/>
            <van-icon class="send-btn" name="share" size="30px" @click="onSend" />
        </div>
    </div>
    <div  style="position: fixed; z-index: 0; top: 0; left: 0; right: 0; visibility: hidden;">
        <audio
            id="talking-audio"
            :src="audioData"
            preload="metadata"
            controls
            @error="onTalkingAudioError"
            @play="onTalkingAudioPlay"
            @pause="onTalkingAudioPause"
            @ended="onTalkingAudioEnd"
            ref="audioRef"
        />
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
import { Kurisu, parseLive2dEmotion } from './KurisuModel';
import { Kurisu as PICKurisu, parsePICdEmotion } from './PICKurisu';
import Live2dDebuggerEditor from './Live2dDebuggerEditor.vue';
import { MotionPriority } from 'pixi-live2d-display';
import { showNotify } from 'vant';
import { Point } from 'pixi.js';
import { ChatResponse } from './interfaces';
import { initChat } from './datas';

const apiDomain = 'https://19hevguuz2.execute-api.ap-northeast-1.amazonaws.com/Prod';
const API = {
    chat: `${apiDomain}/kurisu/chat`
}


const uiState = reactive({
    inited: false,
    showDrawer: false,
    loadingProgress: '',
    sending: false,
    chatContentHeight: 0,
    text: ['...']
});

const inputValue = ref('今日はいい天気ですね。');
const audioData = ref('');
const model: Ref<ModelEntity | undefined> = ref();
const picModel: Ref<PICKurisu | undefined> = ref();
    
const chatContents: Ref<ChatResponse[]> = ref([]);

const audioRef = ref<HTMLAudioElement>();

let app: App;

const initModel = async () => {
    model.value = new Kurisu();
    watchModel(model.value);
}

const initPicModel = async () => {
    const model = new PICKurisu(app.app);
    watchPICModel(model);
    const root = await model.load();
    app?.container.addChild(root);
    model.play('sided_pleasant', false);
    root.x = 0;
    root.y = 600;
    root.scale = new Point(1.06, 1.06);
    picModel.value = model;
}

const initAudio = () => {
    audioRef.value?.addEventListener("loadstart", () => {
        console.log("loadstart");
    });
    audioRef.value?.addEventListener("durationchange",async () => {
        console.log("durationchange");
        console.log(audioRef.value?.paused);
        if (audioRef.value?.paused) {
            await audioRef.value?.play();
        }
    });
    audioRef.value?.addEventListener("loadeddata", () => {
        console.log("loadeddata");
    });
    audioRef.value?.addEventListener("progress", () => {
        console.log("progress");
    });
    audioRef.value?.addEventListener("canplay", async () => {
        console.log("canplay");
    });
    audioRef.value?.addEventListener("canplaythrough", () => {
        console.log("canplaythrough");
    }, {
        once: true
    });
    audioRef.value?.addEventListener("stalled", () => {
        showNotify({
            type: 'warning',
            message: "stalled",
        });
    });
    audioRef.value?.addEventListener("suspend", () => {
        console.log("suspend");
    });
    audioRef.value?.addEventListener("play", () => {
        if (picModel.value) {
            picModel.value.play(undefined, true);
        }
    });
    audioRef.value?.addEventListener("ended", () => {
        console.log("ended");
        if (picModel.value) {
            picModel.value.stop();
        }
    });
    const chat = initChat[Math.floor(Math.random() * initChat.length)];
    chatContents.value.push({
        text: chat.text,
        audio: chat.audio,
        commands: [],
        emotions: {
            emotions: {
                '喜悦': '1',
                '傲娇': '0',
                '悲伤': '0',
                '愤怒': '0', 
            }
        }
    });
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

const watchPICModel = (model: PICKurisu) => {
    model.on('modelLoaded', (pixiModel: Live2DModel) => {
        uiState.loadingProgress = '';
    });
    model.on('loadingProgress', (progress: string) => {
        uiState.loadingProgress = progress;
    });
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
        uiState.chatContentHeight = chatContent?.text ? 100 : 0;
        audioData.value = '';
        if (chatContent) {
            if (model.value) {
                // 解析情绪
                let motionIndex = parseLive2dEmotion(chatContent);
                motionIndex = Math.max(0, motionIndex);
                // m05 高兴  m09 傲娇 m10 悲伤 m04 愤怒
                model.value?.pixiModel?.motion('Idle', motionIndex, MotionPriority.FORCE, chatContent.audio);
            } else if (picModel.value) {
                // 解析情绪
                const emotionKey = parsePICdEmotion(chatContent);
                 // 播放动画
                 picModel.value.play(emotionKey);
                // 播放语音
                audioData.value = chatContent.audio || '';
                audioRef.value!.preload = 'metadata';
               
            }
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
        limit();
        const res = await fetchChat({
            text: inputValue.value.trim()
        });
        // inputValue.value = '';
        chatContents.value.push(Object.assign({}, res.Data));
        updateLimit();
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
    if ((res as any).status !== 200) {
            throw new Error('服务器待机啦，请稍后再试');
    }
    const resObj = await res.json();
    if (resObj.Data?.emotions) {
        resObj.Data.emotions = JSON.parse(resObj.Data.emotions);
    }
    if (resObj.Data?.commands?.length) {
        resObj.Data.commands = resObj.Data.commands.map((item => JSON.parse(item)));
    }
    return resObj;
}

const onTalkingAudioError = (error) => {
    console.error(error);
}

const onTalkingAudioPlay = () => {

}

const onTalkingAudioPause = () => {

}

const onTalkingAudioEnd = () => {

}

const limit = () => {
    const key = formatDate(new Date().getTime(), 'yyyyMMDD');
    const beanRaw = localStorage.getItem(`kurisu${key}`) || '{}';
    try {
        const bean = JSON.parse(beanRaw);
        if (bean) {
            if (bean.count >= 5) {
                throw new Error('今日提问已到达限制次数');
            }
        }
    }
    catch (err) {
        if ((err as any).message === '今日提问已到达限制次数') {
            throw err;
        }
        console.error(err);
    }
};

const updateLimit = () => {
    const key = formatDate(new Date().getTime(), 'yyyyMMDD');
    const beanRaw = localStorage.getItem(`kurisu${key}`) || '{}';
    try {
        const bean = JSON.parse(beanRaw);
        if (bean) {
            bean.count = (Number(bean.count) || 0) + 1;
        }
        localStorage.setItem(`kurisu${key}`, JSON.stringify(bean));
    }
    catch (err) {
        console.error(err);
    }
}

const formatDate = (timestamp, format) => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  const padZero = (num) => (num < 10 ? `0${num}` : num);
  const formatObj = {
    'yyyy': year,
    'MM': padZero(month),
    'dd': padZero(day),
    'HH': padZero(hour),
    'mm': padZero(minute),
    'ss': padZero(second),
  };
  return format.replace(/yyyy|MM|dd|HH|mm|ss/g, (matched) => formatObj[matched]);
}

const initApp = () => {
    app = new App('canvas');
    app.loadBg();
}

onMounted(async () => {
    initApp();
    await initPicModel();
    initAudio();
    // initModel();
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

    .chat-input.disabled {
        opacity: 0.4;
        pointer-events: none;
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
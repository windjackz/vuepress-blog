<template>
    <div class="canvas-container">
        <canvas id="canvas"></canvas>
        <div v-if="uiState.loadingProgress" class="loading-status" :class="{ 'error-tips' : uiState.loadingProgress.indexOf('error') >= 0 }">
            {{ uiState.loadingProgress }}
        </div>
        <div v-if="uiState.chatContentHeight" class="chat-panel-mask" @click="onMaskClick"></div>
        <div class="chat-panel" v-if="!uiState.loadingProgress">
            <div class="handle-btn-area">
                <van-icon v-if="chatContents.length" class="message item" size="30px" name="chat" :badge="chatContents.length" @click="onRead" />
                <van-icon name="music" class="music item"  size="30px" @click="uiState.songsPicker = true" />
                <van-icon class="send-btn" :class="{ 'disabled': !!chatContents.length || uiState.sending }" name="share" size="30px" @click="onSend" />
            </div>
            <div class="chat-content" :style="{ height: `${uiState.chatContentHeight}px` }">
                <div class="p">
                    <VueWriter v-if="uiState.chatContentHeight" :typeSpeed="150" :iterations='1' :array="uiState.text" />
                </div>
            </div>
        </div>
        <div v-if="!uiState.loadingProgress" class="chat-input" :class="{ 'sedding' : uiState.sending, 'disabled': !!chatContents.length }">
            <van-loading class="loading" v-if="uiState.sending" />
            <input :disabled="uiState.sending || !!chatContents.length" type="text" placeholder="..." v-model="inputValue" maxlength="30"/>
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
    <div class="sing-svg" v-if="uiState.singing">
        <svg width="350px" height="200px" viewBox="0 0 300 140" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g id="leavesFall" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
            <g id="notes-copy">
                <image id="notes-2" x="0" y="0" width="58" height="74" xlink:href="data:image/png;base64,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">
                <animate attributeName="x" begin="0s" values="277;0" dur="4s" calcMode="spline" keySplines=".42,.51,.62,.93" repeatCount="indefinite"></animate>
                <animate attributeName="y" begin="0s" values="122;0" dur="4s" calcMode="spline" keySplines=".42,.51,.62,.93" repeatCount="indefinite"></animate>         
                <animate attributeName="opacity" begin="0s" values="0;1;1;1;0.5;0" dur="4s" repeatCount="indefinite"></animate>
                <animate attributeName="width" begin="0s" values="30;58" dur="4s" calcMode="spline" keySplines=".42,.51,.62,.93" repeatCount="indefinite"></animate>     
                <animate attributeName="height" begin="0s" values="35;74" dur="4s" calcMode="spline" keySplines=".42,.51,.62,.93" repeatCount="indefinite"></animate>            
                </image>
                <image id="notes-4" x="0" y="0" width="19" height="37" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAlCAYAAACgc9J8AAAABGdBTUEAA1teXP8meAAAAu1JREFUSA3llrluE1EUhmf3kniPJSJAciIoUAAhsYNYBAWvQMdr8AQ01Ei0PABVEBWioaFgkSiQgLAIRRRYsZ3Y8W4P3z+eIJHFYyclR/pzr+/c8+fsM4bxX4g9oZcL3BuCzrj71riH4bOlmZmZa+wLUXcjyfL5fNqyLDMWi52IIot00/d9p9lsLg4GgxxkK2BPVyMta7fbqxAMgAlOgj0lkgzNPvgRMshVJ9zvWCYhMxKJxLdQMzE7O3t8B0t4MBFZq9X65bpuGx2r0WicORAZysNer/dJZGT1MGtxN8KJLAsVP2rtdDoW5XL2oGQbnuf9dBzHrlQqyqq3nXAaywzTND/0+32VSBycOhAZLn4lEXVIbGJ3YTtZZAdsU/CHw2Gc9lpkzdIdX3i+sXVnKjelNDc39x4iKx6PS/fiFpHWaS0z6NMuU2Se9RD6KpHXQF1iTG2ZlGh6EUhiWHhutN0nGc3/PZVKlSGxsPIyqzI8vZtSknS7XYVoic5IFwqFFdyu7MtNkZVKpTfiJBl2uVy+rrOpEyAlSa1WU9DzlMkCLs9Tg6/2S5aC6Aho0F7nmSqacc0gcGwmklwud7per9+hWEtk1MpkMqYan4QoXOVJyXT5LrgJTArXh4CtYTLf5J2ZTCZHKdVphNzj+Q3gM35E4JNNGWLZtq26M+nZWmQ2Ce5VlG6zKi4upeBCpL3DSLLlrkiz2exKVAKSjJz7xCgeWuKovoidSEyIA+tEzHvi6Z5vGi5Ibmk6jLbB50EQ42q1qiPp+kCWVdfW1t5FkemzwA2VfN5MQbz4bSiTlIVP5YvsBeXRi4rZMYYgofG8dDrtEninWCy6nDnr6+sOGfXIYh2iZ/oHYy2DgGTZNtWuXpRLPq0jV/VFZGKVSaM/Zt8C49uJ4F/R3MI9Gwts3LKUPX1/8NsiAU82Nzefi0gSBHS03fXvJU4fgsAqVlmkfRc8Asvgr0SVxio3P4OjQP34m6J9iWsPsPgtv/+RP9TrGMLr5HW4AAAAAElFTkSuQmCC">
                <animate attributeName="x" begin="-1.25s" values="277;0" dur="4s" calcMode="spline" keySplines=".42,.51,.62,.93" repeatCount="indefinite"></animate>
                <animate attributeName="y" begin="-1.25s" values="122;0" dur="4s" calcMode="spline" keySplines=".42,.51,.62,.93" repeatCount="indefinite"></animate>         
                <animate attributeName="opacity" begin="-1.25s" values="0;1;1;1;0.5;0" dur="4s" repeatCount="indefinite"></animate> 
                <animate attributeName="width" begin="-1.25s" values="10;19" dur="4s" calcMode="spline" keySplines=".42,.51,.62,.93" repeatCount="indefinite"></animate>     
                <animate attributeName="height" begin="-1.25s" values="19;37" dur="4s" calcMode="spline" keySplines=".42,.51,.62,.93" repeatCount="indefinite"></animate>      
                </image>
                <image id="notes" x="0" y="0" width="59" height="70" xlink:href="data:image/png;base64,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">
                <animate attributeName="x" begin="-2.75s" values="277;0" dur="4s" calcMode="spline" keySplines=".42,.51,.62,.93" repeatCount="indefinite"></animate>
                <animate attributeName="y" begin="-2.75s" values="122;0" dur="4s" calcMode="spline" keySplines=".42,.51,.62,.93" repeatCount="indefinite"></animate>         
                <animate attributeName="opacity" begin="-2.75s" values="0;1;1;1;0.5;0" dur="4s" repeatCount="indefinite"></animate> 
                <animate attributeName="width" begin="-2.75s" values="30;59" dur="4s" calcMode="spline" keySplines=".42,.51,.62,.93" repeatCount="indefinite"></animate>     
                <animate attributeName="height" begin="-2.75s" values="35;70" dur="4s" calcMode="spline" keySplines=".42,.51,.62,.93" repeatCount="indefinite"></animate>   
                </image>
            </g>
        </g>
    </svg>
    </div>
    <div class="siri-container-panel" :style="{
        width: `${uiState.singing ? '90vw' : '0' }`
    }">
        <div class="background"></div>
        <div id="siri-container"></div>
    </div>
    <!--音乐选择-->
    <van-popup v-model:show="uiState.songsPicker" round position="bottom">
        <van-picker
            :columns="sings"
            @cancel="uiState.songsPicker = false"
            @confirm="onSingPickerConfirm"
        />
    </van-popup>
    <Live2dDebuggerEditor v-model:show-drawer="uiState.showDrawer" :model="model" />
    <Live2dSettingButton @click="uiState.showDrawer = !uiState.showDrawer" />

</template>

<script setup lang="ts">
import { onMounted, ref, Ref, reactive, watch, nextTick } from 'vue';
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
import { initChat, singsDatas } from './datas';
import SiriWave from "siriwave";
import { getHours } from '../../framework/utils';

const apiDomain = 'https://19hevguuz2.execute-api.ap-northeast-1.amazonaws.com/Prod';
const API = {
    chat: `${apiDomain}/kurisu/chat`
}


const uiState = reactive({
    inited: false,
    showDrawer: false,
    loadingProgress: '',
    sending: false,
    singing: false,
    chatContentHeight: 0,
    text: ['...'],
    songsPicker: false,
});

const sings = singsDatas;

const inputValue = ref('助手！');
const audioData = ref('');
const model: Ref<ModelEntity | undefined> = ref();
const picModel: Ref<PICKurisu | undefined> = ref();
    
const chatContents: Ref<ChatResponse[]> = ref([]);

const audioRef = ref<HTMLAudioElement>();

let app: App;
let siriWave: SiriWave | undefined;

const initModel = async () => {
    model.value = new Kurisu();
    watchModel(model.value);
}

const initPicModel = async () => {
    const model = new PICKurisu(app.app);
    watchPICModel(model);
    const root = await model.load();
    app?.container.addChild(root);
    if (!isMidnight()) {
        model.play('sided_pleasant', false);
    } else {
        model.play('sided_eyes_closed', false);
    }
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
            if (audioRef.value?.src) {
                if (audioRef.value!.src.substring(audioRef.value!.src.length - 4) === '.mp3') {
                    picModel.value.sign();
                    uiState.singing = true;
                } else {
                    picModel.value.play(undefined, true);
                }
            }
        }
    });
    audioRef.value?.addEventListener("ended", () => {
        console.log("ended");
        if (picModel.value) {
            picModel.value.stop();
            uiState.singing = false;
        }
    });
    if (!isMidnight()) {
        const chat = initChat[Math.floor(Math.random() * initChat.length)];
        chatContents.value.push({
            text: chat.text,
            audio: chat.audio,
            commands:  [],
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
        switch (item.commands) {
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
            case 'sing':
                doSing(item.data.name);
                break;

        }
    });
}

const doSing = (songName: string) => {
    if (songName.indexOf('アマデウス') >= 0 || songName.indexOf('Amadeus') >= 0 ) {
        audioData.value = 'https://moremoreda-1257923696.file.myqcloud.com/kurisu/song/kurisu_amadeus.mp3';
        audioRef.value!.preload = 'metadata';
    }
    if (songName.indexOf('zhongwuyan') >= 0 || songName.indexOf('钟无艳') >= 0 ) {
        audioData.value = 'https://moremoreda-1257923696.file.myqcloud.com/kurisu/song/zhongwuyan_cut.mp3';
        audioRef.value!.preload = 'metadata';
    }
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
                audioRef.value?.addEventListener("ended", () => {
                    // 处理动作
                    handleCommands(chatContent);
                }, {
                    once: true,
                });
            }
            uiState.text = [chatContent.text];
        }
    }
} 

const onSend = async () => {
    if (!inputValue.value.trim()) {
        return;
    }

    if (uiState.sending) {
        return;
    }
    
    uiState.sending = true;
    try {
        limit();
        const res = await fetchChat({
            text: inputValue.value.trim(),
            debug2: true,
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

const fetchChat = async ({ text, debug2 = false }: { text: string, debug2: Boolean }): Promise<{
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
            debug2: debug2
        }) // body data type must match "Content-Type" header
    };
    const res = await fetch(API.chat, param);
    if ((res as any).status !== 200) {
        const resObj = await res.json();
        console.log(resObj.Error || resObj.message);
        debugger;
        throw new Error(resObj.Error || resObj.message || '服务器待机啦，请稍后再试');
    }
    const resObj = await res.json();
    if (resObj.Data?.emotions) {
        resObj.Data.emotions = resObj.Data.emotions;
    }
    if (resObj.Data?.commands?.length) {
        resObj.Data.commands = resObj.Data.commands.map((item => item));
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
    const key = formatDate(new Date().getTime(), 'yyyyMMdd');
    const beanRaw = localStorage.getItem(`kurisu${key}`) || '{}';
    if (isMidnight()) {
        throw new Error('助手已经休息了，你也早点休息');
    }
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
    const key = formatDate(new Date().getTime(), 'yyyyMMdd');
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

const onSingPickerConfirm = ({ selectedOptions }) => {
    uiState.songsPicker = false;
    doSing(selectedOptions[0].text);
}

const initApp = () => {
    app = new App('canvas');
    app.loadBg();
}

const isMidnight = () => {
    const hour = getHours();
    if (hour >= 0 && hour <= 6) {
        return true;
    }
    return false;
}

watch(() => uiState.singing, () => {
    nextTick(() => {
        if (siriWave) {
            siriWave.dispose();
            siriWave = undefined;
        }
        if (uiState.singing) {
            siriWave = new SiriWave({
                container: document.getElementById("siri-container")!,
                // 显示比例
                ratio: 1,
                // 动画速度
                speed: 0.2, 
                // 振幅
                amplitude: 1, 
                // 频率(iOS风格)
                frequency: 6, 
                // 曲线颜色 (iOS风格)
                color: "#fff", 
                // 覆盖容器
                cover: false,
                // 自动开始
                autostart: true, 
                // 在画布上步骤数量
                pixelDepth: 0.02, 
                // 插入速度
                lerpSpeed: 0.1,
                style:'ios9'
            });
        }
    });
});


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
    // height: 100vh;
    // padding-bottom: 100%;
    margin: 0 auto;
    left: 0;
    top: 0;
    bottom: 0;
    right: 0;
    z-index: 200;   
    height: calc(100vh - var(--status-bar-height));

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

    .handle-btn-area {
        position: absolute;
        top: -35px;
        left: 0;
        right: 0;
        display: flex;
        flex-direction: row;
        margin-left: 10px;
        margin-right: 10px;

        .send-btn {
            width: 30px;
            cursor: pointer;
            color: white;
            text-shadow: 2px 2px 3px black;
            position: absolute;
            right: 0px;
        }

        .send-btn.disabled {
            color: darkgrey;
            pointer-events: none;
        }

        .music {
            width: 30px;
            cursor: pointer;
            color: white;
        }

        .music.disabled {
            color: darkgrey;
            pointer-events: none;
        }
        .message {
            color: white; 
            font-size: 30px;
            cursor: pointer;
        }

        .item + .item {
            margin-left: 16px;
        }
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
#siri-container {
    margin-top: 5px;
    position: absolute;
    height: 100%;
    width: 90vw;
}

.siri-container-panel {
    position: fixed;
    height: 5vh;
    z-index: 300;
    bottom: 200px;
    left: 0;
    right: 0;
    margin: 0 auto;
    overflow: hidden;
    transition-timing-function: cubic-bezier(.4,0,.2,1);
    transition-duration: .5s;
    transition-property: all;

    .background {
        background-color: black;
        border-radius: 100px;
        opacity: 0.5;
        position: absolute;
        height: 100%;
        width: 100%;
    }
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

.sing-svg {
    position: fixed;
    z-index: 300;
    left: calc(50vw - 350px);
    top: 100px;
}

</style>
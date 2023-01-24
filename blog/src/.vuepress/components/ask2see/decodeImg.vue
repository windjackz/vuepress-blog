<template>
    <div id="decode-img">
        <van-uploader v-model="fileList" preview-size="200" :max-count="1" :after-read="afterRead" @delete="afterDelete"  />
        <div class="block" v-if="question">
            <div v-if="!msg" class="block__question">{{ question }}</div>
            <van-form @submit="onSubmit">
                <van-field
                v-if="!msg"
                v-model="pwd"
                type="textarea"
                label=""
                placeholder="请输入回答"
                :rules="[{ required: true, message: '请输入问题的答案' }]"
                />
                <div style="margin: 16px">
                <van-button color="var(--theme-color)" type="primary" round block native-type="submit" :disabled="!canSubmit">{{ isDone ? '我知道了': '提交' }}</van-button>
                </div>
            </van-form>
        </div>
        <div class="block" v-if="msg">
            <div class="block__title">隐藏的信息：</div>
            <div class="content">{{ msg }}</div>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { showNotify } from 'vant';

const apiDomain = 'https://19hevguuz2.execute-api.ap-northeast-1.amazonaws.com/Prod';
const API = {
    decodeImage: `${apiDomain}/image/decode`
}

const pwd = ref('');
const msg = ref('');
const question = ref('');
const id = ref('');
const isDone = ref(false);
const canSubmit = ref(true);
let fileRef: any = undefined;

const fileList = ref<{ content: string }[]>([]);

// 清除回答
const clearAnswer = () => {
      id.value = '';
      pwd.value = '';
      question.value = '';
};

const afterDelete = () => {
    clearAnswer();
    isDone.value = false;
    question.value = '';
    msg.value = '';
    fileList.value.length = 0;
};

const onSubmit = async () => {
    if (isDone.value) {
        clearAnswer();
        isDone.value = false;
        question.value = '';
        msg.value = '';
        fileList.value.length = 0;
    } else {
        try {
            await handleSubmit();
        } catch (err) {
            showNotify({ type: 'danger', message: err.message || err.Message });
            fileRef.status = 'failed';
            fileRef.message = '解密失败';
        }
        finally {
            canSubmit.value = true;
        }
    }
}

// 请求解密图片
const fetchDecodeImg = async ({ imageBase64Data, answer } : {imageBase64Data: string, answer?: string}) => {
    const feature = 'base64,';
    const imageData = imageBase64Data.substring(imageBase64Data.indexOf(feature) + feature.length);
    const param = {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        headers: {
            'Content-Type': 'application/json'
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
            imageData,
            answer
        }) // body data type must match "Content-Type" header
    };
    const res = await fetch(API.decodeImage, param);
    return res.json();
}

const handleSubmit = async () => {
    msg.value = "";
    fileRef.status = 'uploading';
    fileRef.message = '解密中...';
    canSubmit.value = false;
    const res = await fetchDecodeImg({ imageBase64Data: fileRef.content, answer: pwd.value });
    canSubmit.value = true;
    if (res.Error) {
        throw new Error(res.Error);
    }
    
    if (res.Data?.question?.S && res.Data?.msg?.S) {
        question.value = res.Data.question.S;
        msg.value = res.Data?.msg?.S;
        isDone.value = true;
        fileRef.status = 'done';
        // showNotify({ type: 'primary', message: '图片的主人留下了一个问题' });
        if (res.Data?.question?.S?.indexOf('你的名字') >= 0) {
            const root = document.querySelector(':root');
            root?.setAttribute('style', '--theme-color: #226b9c;');
            document.querySelector("html")?.setAttribute('data-theme', 'dark')
            document.querySelector("#app > div > header")?.setAttribute('style', `background: url("/assets/images/bg_yourname.png") center center / cover no-repeat;`);
            sessionStorage.setItem("theme", "yourname");
        }
    } else if (res.Data?.question?.S) {
        question.value = res.Data.question.S;
        fileRef.message = '等待输入回答...';
    }
    else if (res.Data?.msg?.S) {
        msg.value = res.Data?.msg?.S
        fileRef.status = 'done';
    }
    /* fileList.value = [
        {
        content: fileRef.content,
        },
    ]; */
};

const afterRead = async (file) => {
    // 此时可以自行将文件上传至服务器
    fileRef = file;
    try {
        await handleSubmit();
    } catch (err) {
        showNotify({ type: 'danger', message: err.message || err.Message });
        fileRef.status = 'failed';
        fileRef.message = '解密失败';
    } finally {
        canSubmit.value = true;
    }

};

</script>

<style lang="scss" scoped>

#decode-img {
    text-align: center;
    right: 0;
    left: 0;
    position: relative;
    padding-top: 5rem;
    padding-bottom: 5rem;
}
.block {
  text-align: left;
}
.block__title {
  padding: 32px 16px 16px;
  line-height: 16px;
}
.block__question {
  padding: 10px 16px 16px;
  line-height: 16px;
  font-weight: bold;
}
.tips {
  font-size: 14px;
}
.content {
  padding-left: 16px;
  padding-right: 16px;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>
<template>
    <div id="encode-img">
        <van-form @submit="onSubmit">
            <van-field name="uploader" label="" :rules="[{ required: true, message: '请上传需要隐藏信息的图片' }]">
                <template #input>
                    <van-uploader class="uploader" @delete="afterDelete" v-model="fileList" preview-size="200" :after-read="afterRead" :max-count="1" />
                </template>
            </van-field>
            <div style="background-color:white" v-if="isDone">加密完成，您可以保存上方的图片啦</div>
            <van-field
                v-model="message"
                type="textarea"
                label="隐藏信息"
                placeholder="请输入要隐藏在图片里的信息"
                :rules="[{ required: true, message: '请输入要隐藏在图片里的信息' }]"
            />
            <van-field  name="question" label="开启问题">
                <template #input>
                    <van-switch v-model="checked" />   
                </template>
            </van-field> 
            <van-field
                v-if="checked"
                v-model="question"
                type="textarea"
                label="问题"
                placeholder="请输入问题"
                :rules="[{ required: true, message: '请输入问题' }]"
            />
            <van-field
                v-if="checked"
                v-model="pwd"
                type="textarea"
                label="答案"
                placeholder="请输入答案"
                :rules="[{ required: true, message: '请输入答案' }]"
            />
            <van-field  name="question" label="二维码">
                <template #input>
                    <van-switch v-model="needQrCode" />   
                </template>
            </van-field> 
            <div style="margin: 16px">
                <van-button color="var(--theme-color)" type="primary" round block native-type="submit" :disabled="!canSubmit">提交</van-button>
            </div>
        </van-form>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Compressor from 'compressorjs';
import { showNotify } from 'vant';

const apiDomain = 'https://19hevguuz2.execute-api.ap-northeast-1.amazonaws.com/Prod';
const API = {
    encodeImage: `${apiDomain}/image/encode`
}

const fileList = ref<{ content: string; file: File; url?: string; }[]>([]);
const canSubmit = ref(true);
const pwd = ref('');
const question = ref('');
const checked = ref(false);
const needQrCode = ref(false);
const message = ref('');
const isDone = ref(false);
let fileRef: any = undefined;
const afterDelete = () => {
    canSubmit.value = true;
};

const afterRead = async (file) => {
    fileRef = file;
}

const blobToBase64 = async (blob) => {
  return new Promise((resolve, _) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

// 请求解密图片
const fetchEncodeImg = async ({ imageBase64Data, message, answer, question, qrcode }: { imageBase64Data: string, message: string; answer?: string, question?: string; qrcode?: boolean}) => {
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
            answer,
            question,
            qrcode,
            msg: message
        }) // body data type must match "Content-Type" header
    };
    const res = await fetch(API.encodeImage, param);
    return res.json();
}

const onSubmit = () => {
    canSubmit.value = false;
    isDone.value = false;
    new Compressor(fileList.value[0].file, {
        quality: 0.6,
        success: async (result) => {
            const base64 = await blobToBase64(result) as string;
            try {
                fileRef.status = 'uploading';
                fileRef.message = '加密中...';
               const res = await fetchEncodeImg({
                    imageBase64Data: base64,
                    message: message.value,
                    answer: pwd.value,
                    question: question.value,
                    qrcode: needQrCode.value,
                });
                if (res.Error) {
                    throw new Error(res.Error);
                }
                const imgContent = `data:image/png;base64,${res.Data.imageData}`;
                fileList.value[0].content = imgContent;
                fileList.value[0].url = imgContent;
                console.log(fileList);
                canSubmit.value = true;
                isDone.value = true;
                checked.value = false;
                question.value = "";
                pwd.value = "";
                needQrCode.value = false;
                message.value = ""

                fileRef.status = 'done';
            }
            catch (err) {
                showNotify({
                    type: 'warning',
                    message: err.message,
                });
                fileRef.status = 'failed';
                fileRef.message = '加密失败';
            } finally {
                canSubmit.value = true;
            }
        },
        error(err) {
          showNotify({
            type: 'warning',
            message: err.message,
          });
          canSubmit.value = true;
        },
    });
};
</script>

<style lang="scss" scoped>

#encode-img {
    text-align: center;
    right: 0;
    left: 0;
    position: relative;
    padding-top: 5rem;
    padding-bottom: 5rem;

    .uploader {
        margin: 0 auto;
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
}
</style>
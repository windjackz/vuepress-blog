<template>
    <div class="danmu-container">
        <div class="danmu-background"></div>
        <RecyclerList
            uniqueKey="id"
            :itemList="itemList"
            :hasMore="false"
            :usePullDownRefresh="false"
            :nestBottom="true"
        >
        <!--<template v-slot:item>
            <div>111</div>
        </template>-->
            <template v-slot:item="props">
                <li class="chat-item" :class="{
                    'from-me': props.data.fromMe
                }">
                    <img class="avatar" width="48" height="48" :src="props.data.avatar" />
                    <div class="bubble">
                        <p>{{props.data.message}}</p>
                        <img width="400" height="300" :class="{invisible:!props.data.photo}" :src="props.data.photo" />
                        <div class="meta">
                            <time class="posted-date">{{props.data.createAt}}</time>
                        </div>
                    </div>
                </li>
            </template>
        </RecyclerList>
    </div>
</template>

<script setup lang="ts">
import { onMounted, Ref, ref } from 'vue';
import type { PropType } from 'vue'
import RecyclerList from '../common/recycler-list.vue';
import { DanmuItemData } from './danmuConfig';

const props = defineProps({
        itemList: {
            type: Object as PropType<DanmuItemData[]>,
            default: () => [],
    }
});
</script>

<style lang="scss" scoped>
.danmu-container {
    position: absolute;
    width: calc((50vw - 13vw) * 0.75);
    height: 70vh;
    z-index: 200;
    bottom: calc(200px);
    left: calc((50vw - 13vw - ((50vw - 13vw) * 0.75)) * 0.5);
}
.danmu-background {
    position: absolute;
    width: 100%;
    height: 100%;
    background-color: white;
    opacity: 0.5;
}

.chat-item {
    display: flex;
    padding: 10px 0;
    width: 100%;
    contain: layout;
    will-change: transform;
}
.avatar {
    border-radius: 500px;
    margin-left: 20px;
    margin-right: 6px;
    min-width: 48px;
}
.chat-item p {
    margin: 0;
    word-wrap: break-word;
    font-size: 24px;
}
.chat-item .bubble img {
    max-width: 100%;
    height: auto;
}
.bubble {
    padding: 7px 10px;
    color: #333;
    background: #fff;
    box-shadow: 0 3px 2px rgba(0,0,0,0.1);
    position: relative;
    max-width: 420px;
    min-width: 80px;
    margin: 0 5px;
    text-align: left;
    font-size: 16px;
}

.bubble::before {
    content: '';
    border-style: solid;
    border-width: 0 10px 10px 0;
    border-color: transparent #fff transparent transparent;
    position: absolute;
    top: 0;
    left: -10px;
}
.meta {
    font-size: 0.8rem;
    color: #999;
    margin-top: 3px;
}

.from-me {
    justify-content: flex-end;
}

.from-me .avatar {
    order: 1;
    margin-left: 6px;
    margin-right: 20px;
}

.from-me .bubble {
    // background: #F9D7FF;
}

.from-me .bubble::before {
    left: 100%;
    border-width: 10px 10px 0 0;
    border-color: #ffffff transparent transparent transparent;
}
.state {
    display: none;
}
.invisible {
    display: none;
}
</style>
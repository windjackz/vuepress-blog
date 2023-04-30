import { onMounted, ref, Ref, reactive } from 'vue';

export interface MotionGroupEntry {
    name: string
    motions: {
        file: string;
        error?: any;
    }[]
}
export const motionGroupsRef: Ref<MotionGroupEntry[]> = ref([]);

export const initChat = [
    {
        audio: '/assets/sounds/kurisu/hello.wav',
        text: 'Hello~'
    },
    /* {
        text: '我来给你唱首歌吧',
        audio: '/assets/sounds/kurisu/hello.wav',
        commands: [{
            commands: {
                action: 'sign',
                data: 'アマデウス'
            }
        }]
    } */
];

export const singsDatas = [
    { text: 'アマデウス', value: 'アマデウス' },
    { text: '钟无艳', value: '钟无艳' }
];

export const ttsLangsDatas = [
    { text: '日文', value: 'jp' },
    /* { text: '中文', value: 'cn' } */
];
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
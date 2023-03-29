import { onMounted, ref, Ref, reactive } from 'vue';
import { MotionGroupEntry } from './interfaces';

export const motionGroupsRef: Ref<MotionGroupEntry[]> = ref([]);

export const initChat = [
    {
        audio: '/assets/sounds/kurisu/hello.wav',
        text: 'Hello~'
    }
];
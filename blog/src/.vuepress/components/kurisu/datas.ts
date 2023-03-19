import { onMounted, ref, Ref, reactive } from 'vue';

export interface MotionGroupEntry {
    name: string
    motions: {
        file: string;
        error?: any;
    }[]
}
export const motionGroupsRef: Ref<MotionGroupEntry[]> = ref([]);
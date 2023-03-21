import { ModelEntity } from "../../framework/live2d/ModelEntity";
import { motionGroupsRef } from "./datas";
import { ChatResponse } from "./interfaces";

export class Kurisu extends ModelEntity {
    constructor() {
        super('/assets/live2d/Hiyori/hiyori.model3.json');
    }
}

export const parseLive2dEmotion = (chatContent: ChatResponse) => {
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
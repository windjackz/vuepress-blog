import { Application, AnimatedSprite, Container } from 'pixi.js';
import { Loader } from 'pixi.js';
import { EventEmitter } from '@pixi/utils';
import { ChatResponse } from './interfaces';

export type PICModelEmotion = 'happy' | 'sided_pleasant' | 'sided_blush' | 'sad' | 'sided_angle';

export class Kurisu extends EventEmitter {
    private animationDict: Map<string, AnimatedSprite> = new Map();
    private animations: AnimatedSprite[]  = [];
    constructor(readonly app: Application) { 
        super();
    }
    private container = new Container();
    private curAnimation: AnimatedSprite | undefined;
    private curEmotion = 'sided_pleasant';
    
    async load() {
        this.container.width = 0;
        this.container.height = 0;
        const assets = [
            '/assets/images/kurisu_animate/happy/talk.json',
            '/assets/images/kurisu_animate/sided_pleasant/talk.json',
            '/assets/images/kurisu_animate/sided_blush/talk.json',
            '/assets/images/kurisu_animate/sad/talk.json',
            '/assets/images/kurisu_animate/sided_angry/talk.json'
        ];
        for (let i = 0; i < assets.length; i += 1) {
            await this.loadAsset(assets[i]);
            this.emit('loadingProgress', assets.map((item) => {
                `item.replace('/assets/images/kurisu_animate/', '').replace('/talk.json', '') [X]`;
            }));
        }
        return this.container;
    }

    async loadAsset(url) {
        return new Promise((resolve, reject) => {
            const setup = () => {
                // get a reference to the sprite sheet you've just loaded:
                const regex = /\/assets\/images\/kurisu_animate\/(\S+)\/talk.json/;
                const regexRes = regex.exec(url);
                if (regexRes && regexRes.length) {
                    const emotion = regexRes[1];
                    if (emotion) {
                        const sheet = this.app.loader.resources[url]?.spritesheet;
                        if (sheet && sheet.animations[`kurisu_${emotion}`]) {
                            const as = new AnimatedSprite(sheet.animations[`kurisu_${emotion}`]);
                            this.animationDict.set(`kurisu_${emotion}`, as);
                            this.animations.push(as);
                            // as.anchor.set(0.5, 0);
                            return resolve(null);
                        }
                    }
                }
                return reject(new Error(`${url} load error`));
            }
            this.app.loader.add(url).load(setup);
        });
    };

    stop() {
        if (this.curAnimation) {
            this.curAnimation.gotoAndStop(0);
            this.emit('onIdle');
        }
    }

    play(emotion?: PICModelEmotion, talk = false) {
        if (emotion) {
            this.curEmotion = emotion;
        }
        const key = `kurisu_${this.curEmotion}`;
        const targetAnimation = this.animationDict.get(key);
        this.animations.forEach((animation) => {
            if (targetAnimation !== animation) {
                if (this.container.children.includes(animation)) {
                    this.container.removeChild(animation);
                }
            } else {
                if (!this.container.children.includes(animation)) {
                    this.container.addChild(animation);
                }
            }
        });
        if (targetAnimation) {
            this.curAnimation = targetAnimation;
            if (talk) {
                targetAnimation.animationSpeed = 1/6; 
                targetAnimation?.play();
                this.emit('onTalking');
            } else {
                targetAnimation.gotoAndStop(0);
                this.emit('onIdle');
            }
        }
    }
}

export const parsePICdEmotion = (chatContent: ChatResponse) => {
    let emotionKey = 'happy';
    if (chatContent.emotions) {
        const sortedEmotion = [{
            param: [{
                key: 'sided_blush',
                value: 5,
            }],
            value: Number(String(chatContent.emotions.emotions.傲娇).charAt(0)) || 0
        },
        {
            param: [{
                key: 'sided_pleasant',
                value: 3,
            },
            {
                key: 'happy',
                value: 5,
            }],
            value: Number(String(chatContent.emotions.emotions.喜悦).charAt(0)) || 0
        },
        {
            param: [{
                key: 'sad',
                value: 5,
            }],
            value: Number(String(chatContent.emotions.emotions.悲伤).charAt(0)) || 0
        },
        {
            param: [{
                key: 'sided_angry',
                value: 5,
            }],
            value: Number(String(chatContent.emotions.emotions.愤怒).charAt(0)) || 0
        }
        ];
        sortedEmotion.sort((a, b) => (b.value - a.value));
        const emotions = sortedEmotion[0];
        emotionKey = emotions.param[0].key;
        if (emotions.param.length > 1) {
            emotionKey = emotions.param.find((item) => item.value >= emotions.value)?.key || '';
        }
        
    }
    return emotionKey as PICModelEmotion;
}
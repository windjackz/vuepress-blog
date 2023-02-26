import { Application, Ticker, Container, Point, Sprite } from 'pixi.js';
import { Live2DModel } from '../../framework/live2d/Live2DModel';

Live2DModel.registerTicker(Ticker);
const designSize = { w: 1920, h: 1080 };

export default class App {

    public container: Container;
    public app: Application;

    private bg: Sprite;

    constructor(canvasId: string) {
        const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        if (canvas) {
            this.app = new Application({
                resizeTo: canvas,
                view: canvas,
                antialias: true, // default:false 开启抗锯齿
                transparent: true, // 是否开启透明通道
                backgroundColor: 0x000000
            });
            this.container = new Container();
            this.app.stage.addChild(this.container);
    
            const resize = () => {
                const wViewPort = this.app.screen.width;
                const hViewPort = this.app.screen.height;
                const rViewPort = wViewPort / hViewPort;
                const rImage = designSize.w / designSize.h;
                let scale = 1;
                if (rImage < rViewPort) {
                    scale = wViewPort / designSize.w;
                } else {
                    scale = hViewPort / designSize.h;
                }
                this.container.scale = new Point(scale, scale);
                this.container.x = wViewPort / 2;
                this.container.y = hViewPort / 2;
                this.app.render();
            };
    
            this.app.renderer.on('resize', () => {
                resize();
            });
    
            resize();
        }
    }

    loadBg() {
        this.bg = Sprite.from('/assets/images/kurisu/BG01A.png');
        this.bg.position.x = -designSize.w / 2;
        this.bg.position.y = -designSize.h / 2;
        this.container.addChild(this.bg);
    }
}

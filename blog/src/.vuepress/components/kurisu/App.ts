import { Application, Ticker, Container, Point } from 'pixi.js';
import { Live2DModel } from '../../framework/live2d/Live2DModel';

Live2DModel.registerTicker(Ticker);

export default class App {

    public container: Container;
    public app: Application;

    constructor(canvasId: string) {
        const designSize = { w: 1920, h: 1080 };
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
}

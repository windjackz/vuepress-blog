<template>
    <canvas id="canvas"></canvas>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { Application, Ticker, Container, Point } from 'pixi.js';
import { Live2DModel } from 'pixi-live2d-display';

Live2DModel.registerTicker(Ticker);

let container: Container;
let app: Application;

onMounted(async () => {
    const designSize = { w: 1920, h: 1080 };
    const canvas = document.getElementById('canvas') as HTMLCanvasElement;
    if (canvas) {
        app = new Application({
            resizeTo: window,
            view: canvas,
            antialias: true, // default:false 开启抗锯齿
            transparent: true, // 是否开启透明通道
            backgroundColor: 0x000000
        });
        container = new Container();
        app.stage.addChild(container);
        const model = await Live2DModel.from('/assets/live2d/kurisu/kurisu.model.json');
        const modelScale = 0.2;
        model.x = -designSize.w / 2 + 3000 * modelScale;
        model.y = -designSize.h / 2 + 2200 * modelScale;
        model.scale.set(1 - modelScale, 1- modelScale);
        model.anchor.set(0.5, 0.5);
        container.addChild(model);

        const resize = () => {
            const wViewPort = app.screen.width;
            const hViewPort = app.screen.height;
            const rViewPort = wViewPort / hViewPort;
            const rImage = designSize.w / designSize.h;
            let scale = 1;
            if (rImage < rViewPort) {
                scale = wViewPort / designSize.w;
            } else {
                scale = hViewPort / designSize.h;
            }
            container.scale = new Point(scale, scale);
            container.x = wViewPort / 2;
            container.y = hViewPort / 2;
            app.render();
        };

        app.renderer.on('resize', () => {
            resize();
        });

        resize();
    }
});
</script>

<style lang="scss" scoped>
#canvas {
    width: 80%;
}
</style>
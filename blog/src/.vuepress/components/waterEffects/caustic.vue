<template>
    <div id="caustic-canvas-container">
    </div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import * as PIXI from 'pixi.js';

let container: PIXI.Container;
let app: PIXI.Application;

const designSize = { w: 1948, h: 1122 }; // 背景图片的宽高
let time = 0;

const geometry = new PIXI.Geometry()
      .addAttribute(
        'aVertexPosition', // the attribute name
        [
          0,
          0, // x, y
          designSize.w,
          0, // x, y
          designSize.w,
          designSize.h,
          0,
          designSize.h
        ], // x, y
        2 // the size of the attribute
      ) 
      .addAttribute(
        'aUvs', // the attribute name
        [
          0,
          0, // u, v
          1,
          0, // u, v
          1,
          1,
          0,
          1
        ], // u, v
        2  // the size of the attribute
      )
      .addIndex([0, 1, 2, 0, 2, 3]); // 三角形索引，一个矩形由两个三角形组成

// 顶点着色器
const vertexSrc = `
    precision mediump float;

    attribute vec2 aVertexPosition;
    attribute vec2 aUvs;

    uniform mat3 translationMatrix;
    uniform mat3 projectionMatrix;

    varying vec2 vUvs;

    void main() {

        vUvs = aUvs;
        gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);

    }`;

 // 片元着色器
 const fragmentSrc = `
        precision mediump float;

        varying vec2 vUvs;

        uniform sampler2D uSampler;
        uniform sampler2D uWave;
        uniform sampler2D uCaustic;
        uniform float time;
        #define PI 3.1415926
        #define colorStepUv 5.7
        vec3 color = vec3(0.54, 0.74, 0.97);

        vec2 panner(vec2 uv, float direction, float speed, vec2 offset, float tiling)
        {
            direction = direction * 2. - 1.;
            vec2 dir = normalize(vec2(cos(PI * direction), sin(PI * direction)));
            return  (dir * time * speed) + offset + (uv * tiling);
        }

        vec3 rgbSplit(float split, sampler2D tex, vec2 uv)
        {
            vec2 UVR = uv + vec2(split, split);
            vec2 UVG = uv + vec2(split, -split);
            vec2 UVB = uv + vec2(-split, -split);

            float r = texture2D(tex, UVR).r;
            float g = texture2D(tex, UVG).g;
            float b = texture2D(tex, UVB).b;

            return vec3(r,g,b);
        }

        vec3 caustic()
        {
        vec2 uv = vUvs;

        float strength = 0.27;
        float split = 0.5 * 0.01;
        float speed = 0.08;
        float scale = 0.8;

        vec3 texture1 = rgbSplit(split, uCaustic, panner(uv, 1., speed, vec2(0., 0.), 1./scale));
        vec3 texture2 = rgbSplit(split, uCaustic, panner(uv, 1., speed, vec2(0., 0.), -1./scale));
        vec3 textureCombined = min(texture1, texture2);

        return strength * 10. * textureCombined;
        }


        void main() {
        vec2 uvs = vUvs;
        vec3 causticColor = vec3(0.13, 0.12, 0.39);
        float s = time * 0.13;
        vec2 offset = texture2D(uWave,uvs + s * vec2(0, 0.3)).xy * 0.015;
        vec2 waveuv = uvs + offset;
        vec4 fg = texture2D(uSampler, waveuv);
        vec4 o = texture2D(uSampler, uvs);
        fg.rgb += caustic() * causticColor;
        gl_FragColor = uvs.y < 0.223 ? o : fg;
    }`;

const uniforms = {
    uSampler: PIXI.Texture.from('/assets/images/watereffect/01.png'),
    uWave: PIXI.Texture.from('/assets/images/watereffect/05.png'),
    time,
    uCaustic: PIXI.Texture.from('/assets/images/watereffect/08.png')
};
uniforms.uWave.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT; // 设置超过纹理坐标时纹理循环
uniforms.uCaustic.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT; // 同上

const shader = PIXI.Shader.from(vertexSrc, fragmentSrc, uniforms);
      
onMounted(() => {
    const canvas = document.getElementById('caustic-canvas-container');
    if (canvas) {
        app = new PIXI.Application({
            resizeTo: canvas,
            antialias: true, // default:false 开启抗锯齿
            transparent: false, // 是否开启透明通道
            backgroundColor: 0xffffff
        });
        canvas.appendChild(app.view);
        const quad = new PIXI.Mesh(geometry, shader);
        quad.x = -designSize.w / 2;
        quad.y = -designSize.h / 2;
        container = new PIXI.Container();
        app.stage.addChild(container);
        container.addChild(quad);

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
            container.scale = new PIXI.Point(scale, scale);
            container.x = app.screen.width / 2;
            container.y = app.screen.height / 2;
            app.render();
        };
        app.renderer.on('resize', () => {
            resize();
        });
        app.ticker.add(() => {
            time += 1 / 60;
            quad.shader.uniforms.time = time;
        });
        resize();
    }
});

onBeforeUnmount(() => {
  app?.renderer.off('resize');
  app?.destroy();
});
</script>

<style lang="scss" scoped>
#caustic-canvas-container {
    width: 100%;
    aspect-ratio: 16/9;
}
</style>
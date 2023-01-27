---
title: 前端Shader实现水面特效
icon: article
description: 本文基于Shader以及Pixi.js实现前端水面特效。
category:
  - 教程
tag:
  - shader
  - web
star: true
---

<script setup lang="ts">
import WaterEffectFinal from "@WaterEffectFinal";
import WaterEffectWave from "@WaterEffectWave";
import WaterEffectCaustic from "@WaterEffectCaustic";
</script>

## 最终效果

先看最终效果：
<ClientOnly>
  <WaterEffectFinal />
</ClientOnly>

## 背景
产品希望给首页的水面背景添加特效，使水面更加生动。

背景图类似下面这张：

![](/assets/images/watereffect/01.png)

一般来说，前端提到特效可能会想到使用视频、序列帧动画，Lottie等方案。

然而针对水面特效，以上方案会引入额外的资源加载，这对首页并不友好。并且由于资源大小限制，最终的效果不一定能很好。

那么有没什么不用引入过多额外资源，效果又不错的方案？

## 分析

实际上，对于游戏客户端领域，水面效果是常见的需求，也是大家一直在致力研究的方向之一。简单的水面效果往往可以通过Shader（着色器）来实现。

Webgl早就被现代浏览器广泛支持了，因此，Web前端也可以基于Webgl 以及 Shader实现简单的水面效果。

由于Webgl的编码比较繁琐，有一定的上手门槛。因此本文将会使用PIXI.js来间接操作Webgl以及Shader。

PIXI.js[^1]是一个非常快且轻量级的2D 渲染库。它封装了便于开发的接口，使得开发者无需深入掌握Webgl API也可以享受Webgl带来的好处。在不兼容的情况下，它也支持退回到H5 canvas模式。可以把它当作是2D领域上的Three.js。

本次需求将会实现水面效果的两个部分：

-  水面的波动效果

-  水面的焦散效果

基于上面两个效果已经能实现不错的水面特效了。


## 实现

### 1、 从展示一张图片开始
首先我们通过PIXI.js显示我们的背景图。

(1) 在项目中引入PIXI.js：
```bash
npm install pixi.js@6.1.0 --save
```
(2) 初始化PIXI.js

```typescript
import * as PIXI from 'pixi.js';

const canvas = document.getElementById('canvas');

const app = new PIXI.Application({
  resizeTo: canvas,
  antialias: true, // default:false 开启抗锯齿
  transparent: false, // 是否开启透明通道
  backgroundColor: 0x00000
});

canvas.appendChild(app.view);
```
(3) 创建一个图片，并显示出来。

首先我们定义一个平面需要的网格顶点数据以及纹理坐标。

```typescript
	const designSize = { w: 1948, h: 1122 }; // 背景图片的宽高
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

```

![](/assets/images/watereffect/02.png)

定义顶点着色器(Vertex Shader)以及片元着色器(Fragment Shader)。
```c
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

   void main() {

       gl_FragColor = texture2D(uSampler, vUvs);

   }`;
 
  const uniforms = {
    uSampler: PIXI.Texture.from(require('@/assets/images/index/backgroundNew.png')),
  };
  
  const shader = PIXI.Shader.from(vertexSrc, fragmentSrc, uniforms);
```

通过PIXI.Mesh对象把上面定义的网格数据以及着色器关联起来，成为一个可以显示的对象，并添加到舞台上。

```typescript
const quad = new PIXI.Mesh(geometry, shader);
app.stage.addChild(container);
```

这样就能在网页上看到背景图片了。

你可能会疑惑，天呐，只是显示一张图片就要这么多的代码。这其实都是为了能够修改着色器代码片段，做出不同的渲染效果。

要理解上面的代码可能需要一点渲染流水线的知识。简单地说，我们把渲染所需要的数据（如网格顶点，纹理贴图等）提交到显存，GPU通过一定的坐标变换和计算，最终把像素色值输出到屏幕上。这个过程，很多步骤都是内置程序固定好的，我们无法干涉。但也有一些步骤暴露了出来，以便开发者可以修改渲染的效果。上面的顶点着色器和片元着色器就是我们可以修改的步骤之一。下图显示了渲染流水线的主要阶段。


几何阶段一个重要的工作，就是对网格中的顶点数据做一系列的坐标变换，计算这些顶点在屏幕最终绘制的位置。

![](/assets/images/watereffect/03.png)

![](/assets/images/watereffect/04.png)

顶点着色器的最基本的任务，就是把顶点坐标从网格数据的模型空间变换到裁剪空间。上面的顶点着色器代码显示了如何实现这一过程：
```c
gl_Position = vec4((projectionMatrix * translationMatrix * vec3(aVertexPosition, 1.0)).xy, 0.0, 1.0);
```

如果你对线性代数还有印象，你应该会记得我们可以通过矩阵实现各种几何变换。其中projectionMatrix和translationMatrix是PIXI帮我们处理好的变换矩阵。在着色器中可以直接使用。translationMatrix[^4] [^5] 用于模型空间到世界空间的变换。projectionMatrix[^6]则可用于将点从世界空间转换为标准化设备坐标(NDC)。gl_Position是一个齐次坐标，由于是平面的，所以我们把z设为0，第四维w是透视投影的结果，由于是二维平面（正交投影），因此这个值设置为1。

片元着色器则用于计算像素颜色，上面的片元着色器直接对纹理进行采样，输出颜色值：
```c
gl_FragColor = texture2D(uSampler, vUvs);
```

其中，uSampler是背景图，uvs是纹理坐标，在生成geometry的时候，我们就已经对顶点和纹理设定了映射关系。渲染的时候会自动进行插值。

### 2、 实现水面波动效果
水面波动的效果实现很简单，首先我们使图像发生类似水纹的扭曲，然后再让扭曲的地方位移就可以了。
这里我们通过用一张噪声图去使采样的uv发生偏移，从而实现图像的扭曲。

噪声图[^7]如下：

![](/assets/images/watereffect/05.png)

修改uniform变量，添加噪声图的纹理。

```typescript
const uniforms = {
    uSampler: PIXI.Texture.from(require('@/assets/images/index/backgroundNew.png')),
    uWave: PIXI.Texture.from(require('@/assets/images/index/waterWave.png'))
  };
uniforms.uWave.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT; // 设置超过纹理坐标时纹理循环
```
修改片元着色器，采样的时候以噪声图的xy值再乘以一个系数作为偏移值。通过系数可以调整偏移的效果。

```c
  const fragmentSrc = `
    precision mediump float;

    varying vec2 vUvs;

    uniform sampler2D uSampler;
    uniform sampler2D uWave;

    void main() {
        vec2 offset = texture2D(uWave,vUvs).xy * 0.015;
        gl_FragColor = texture2D(uSampler, vUvs + offset);

    }`;
```

这时会看到背景图片多了一些波纹。

![](/assets/images/watereffect/06.png)

接着我们给波纹加上位移。首先我们添加一个回调函数，每帧都会使得time变量增大。我们把time变量传到着色器里，用于计算位于。
```typescript
let time = 0; // 时间

const uniforms = {
    uSampler: PIXI.Texture.from(require('@/assets/images/index/backgroundNew.png')),
    uWave: PIXI.Texture.from(require('@/assets/images/index/waterWave.png')),
    time
  };
  
 app.ticker.add(() => {
   time += 1 / 60;
   quad.shader.uniforms.time = time;
 });
```
接着在shader中计算位移
```c
  const fragmentSrc = `
    precision mediump float;


    varying vec2 vUvs;
    uniform float time;
    uniform sampler2D uSampler;
    uniform sampler2D uWave;

    void main() {
        vec2 s = time * 0.13 * vec2(0, 0.3);
        vec2 offset = texture2D(uWave,vUvs + s).xy * 0.015;
        gl_FragColor = texture2D(uSampler, vUvs + offset);

    }`;
```
其中vec2(0, 0.3)是位移的方向。uv是一个左下角原点(0,0)，右上角(1,1)的二维坐标系。0.13是一个调控速度的因子。

这样就能看到波纹位移的效果了。但是会发现天空也有波纹在位移，我们再调整一下片元着色器的输出，只在水面的区域产生扭曲和位移。
```c
gl_FragColor =  vUvs.y < 0.223 ? texture2D(uSampler,vUvs) : texture2D(uSampler, vUvs + offset);
```

至此，应该能看见以下效果：

<ClientOnly>
  <WaterEffectWave />
</ClientOnly>

### 3、 实现水面焦散效果
焦散是一种由曲面引起的光反射现象，这会让我们的水面看起来“波光粼粼”。

![](/assets/images/watereffect/07.jpeg)


要真实地复刻这种效果是非常困难的，我们还是通过纹理贴图的方式来模拟。只要看起来效果是好的，那它就是对的。

![](/assets/images/watereffect/08.png)

[^8]为此做了试验。要想达到好的效果，需要以下三个步骤：
- 以不同的速度，尺寸重复采样纹理两次。
- 使用min函数混合两次采样的结果。
- 在采样时拆分RGB通道。

现在我们来实现上面三个步骤。

首先引入纹理图片：
```typescript
const uniforms = {
   uSampler: PIXI.Texture.from(require('@/assets/images/index/backgroundNew.png')),
   uWave: PIXI.Texture.from(require('@/assets/images/index/waterWave.png')),
   time,
   uCaustic: PIXI.Texture.from(require('@/assets/images/index/caustic.png'))
 };
 uniforms.uWave.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT; // 设置超过纹理坐标时纹理循环
 uniforms.uCaustic.baseTexture.wrapMode = PIXI.WRAP_MODES.REPEAT; // 同上
```

```c
 const fragmentSrc = `
 	...
 	uniform sampler2D uCaustic;
 `
```
定义焦散纹理的采样函数：
```c
 const fragmentSrc = `
 	...
 	uniform sampler2D uCaustic;

    vec3 caustic()
    {
      float strength = 2.7;
      float scale = 0.8;

      vec4 sample1 = texture2D(uCaustic, vUvs * 1./scale);
      vec4 sample2 = texture2D(uCaustic, vUvs * -1./scale);
      vec3 textureCombined = min(sample1.rgb, sample2.rgb);

      return strength * textureCombined;
    }
 `
```
其中scale用于控制焦散纹理的缩放，我们对焦散纹理进行了两次采样，第二次通过反转纹理（*-1）以达到不同速度，尺寸的目的。最后使用min函数对两次采样的结果进行混合。strength作为强度的印象因子。

把采样的纹理添加到背景图片的纹理上进行输出：
```c
 void main() {
    vec3 causticColor = vec3(0.13, 0.12, 0.39);
    vec2 s = time * 0.13 * vec2(0, 0.3);
    vec2 offset = texture2D(uWave,vUvs + s).xy * 0.015;
    vec4 o = texture2D(uSampler, vUvs + offset);
    vec3 causticSampleColor = caustic() * causticColor;
    o.rgb += causticSampleColor;
    gl_FragColor =  vUvs.y < 0.223 ? texture2D(uSampler,vUvs) : o;
}`
```
这里causticColor用于防止采样的结果过暴，同时对采样的结果进行一定的颜色调整，以达到更好的显示效果。

此时会看到如下效果：

![](/assets/images/watereffect/09.png)

焦散的纹理已经添加到图片上了，但是并不明显，我们再加一些动画：
```c
    vec3 caustic()
    {
      float strength = 2.7;
      float scale = 0.8;
      float speed = 0.08;

      vec2 s = time * speed * vec2(0, 1.0);
      vec4 sample1 = texture2D(uCaustic, vUvs * 1./scale + s);
      vec4 sample2 = texture2D(uCaustic, vUvs * -1./scale + s);
      vec3 textureCombined = min(sample1.rgb, sample2.rgb);

      return strength * textureCombined;
    }
```
这样焦散纹理就动起来了，已经非常接近文章开篇展示的效果。

最后我们实现在采样时拆分RGB通道。为什么要进行拆分呢？这是因为不同波长的光在穿过介质时会产生不同的衍射。这意味着光在水中移动时可以“分裂”成不同的颜色。

为了模拟这种效果，我们可以在采样焦散纹理时，拆分成RGB三个通道，并给他们加上微小的偏移。
首先定义一个拆分的方法：
```c
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
```
然后调用：
```c
vec3 caustic()
{
  float strength = 2.7;
  float scale = 0.8;
  float speed = 0.08;
  float split = 0.5 * 0.01;

  vec2 s = time * speed * vec2(0, 1.0);
  vec3 sample1 = rgbSplit(uCaustic, split, vUvs * 1./scale + s);
  vec3 sample2 = rgbSplit(uCaustic, split, vUvs * -1./scale + s);
  vec3 textureCombined = min(sample1.rgb, sample2.rgb);

  return strength * textureCombined;
}
```
效果如下：

<ClientOnly>
  <WaterEffectCaustic />
</ClientOnly> 

### 4、 一点优化
现在效果已经相当不错了。但是水面和非水面的边界可能会有一些明显，有一点突兀的感觉。这里我们通过mix函数及smoothstep进行边界处的平滑处理。

下面shader代码的作用是：当水面接近边界时，呈现白色。

```c
o.rgb = mix(o.rgb, vec3(1., 1., 1.) , smoothstep(0.68, 0.89 ,1.0 - vUvs.y)).rgb;
gl_FragColor =  vUvs.y < 0.223 ? texture2D(uSampler,vUvs) : o;
```
mix用于把两种颜色混合起来；smoothstep则是平滑函数：
```c
float smoothstep(float t1, float t2, float x) {
  // Scale, bias and saturate x to 0..1 range
  x = clamp((x - t1) / (t2 - t1), 0.0, 1.0); 
  // Evaluate polynomial
  return x * x * (3 - 2 * x);
}
```
smoothstep[^9]函数接受的参数有三个。其中：
- t1 代表样条插值函数的下界；
- t2 代表样条插值函数的上界；
- x 代表用于插值的源输入。

x会先按照给定的上界和下界对给定的源输入进行归一化，使输出值在0到1之间。之后将该值运用到样条插值函数中。当x等于t1时，结果值为0、当x等于t2时，结果值为1。

该函数的输出值是界于0到1之间的数。一般情况下，如果我们想要创建一个能够输出平滑过渡的阈值函数，smoothstep就是很好的选择。

最后我们再给水面整体加一点偏色，就能达到文章开头的效果：
```c
#define colorStepUv 5.7
vec3 color = vec3(0.54, 0.74, 0.97);

void main() {
	...
    o.rgb *= smoothstep(-0.1, 1.5, vUvs.y * colorStepUv * color.rgb);
    o.rgb = mix(o.rgb, vec3(1., 1., 1.) , smoothstep(0.68, 0.89 ,1.0 - vUvs.y)).rgb;
    gl_FragColor =  vUvs.y < 0.223 ? texture2D(uSampler,vUvs) : o;
}
```

## 引用及参考

[^1]:  https://github.com/pixijs/pixijs

[^2]: http://candycat1992.github.io/unity_shaders_book/unity_shaders_book_images.html

[^3]: https://juejin.cn/post/6890795086054260750

[^4]:https://pixijs.download/v5.1.2/docs/packages_graphics_src_Graphics.js.html

[^5]: https://api.pixijs.io/@pixi/display/PIXI/DisplayObject.html#worldTransform

[^6]: https://api.pixijs.io/@pixi/core/PIXI/ProjectionSystem.html

[^7]: https://store.cocos.com/app/detail/3900

[^8]: https://www.alanzucconi.com/2019/09/13/believable-caustics-reflections

[^9]: https://www.jianshu.com/p/66035ae91bfd



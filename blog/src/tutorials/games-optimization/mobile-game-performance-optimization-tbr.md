---
title: 1分钟了解手游性能优化(4)——GPU渲染架构之TBR
icon: article
description: 
category:
  - 教程
tag:
  - game
star: false
---

在上一篇[文章](/tutorials/games/mobile-game-performance-optimization-imr.html)中，我们简单地了解到PC端常用的渲染架构Immediately Mode Rendering（IMR）。

在一些常见的复杂渲染算法中，IMR往往需要处理大量的数据，而这些数据通常是无法完全塞入GPU的Cache的，因此经常会需要与系统内存进行交互读写（如深度buffer，color buffer，stencil等等）,这对带宽有着比较高的要求，同时还会产生较高的能耗。

移动端上采用SOC的架构，GPU与CPU是共享一块内存，带宽及功耗严重受限，并不适合IMR。

为了解决上述两个问题，Tile-based Rendering（TBR）的GPU框架应运而生。在这篇文章中，我们简单地了解移动端常用的渲染架构Tile Based Rendering(TBR)。


![Tile-based Rendering（TBR）](/assets/images/mobile-game-opt/TBR.png)

TBR意为将整个屏幕分割成一个个互不重叠的区块（Tile）,每次只渲染一个Tile。在Tile渲染完成之后，再将其结果输出到FrameBuffer中对应的区域。

为什么要这样做呢，是因为在移动端的SOC中，GPU中有一块超高速的On-Chip芯片，其作用类似于常说的Cache。由于On-Chip芯片容量较小，无法将整屏的FrameBuffer数据全部塞进去，所以就需要将一帧的FrameBuffer分割成一个个的互不重叠的Tile。这样在渲染每个Tile的时候，所有需要的数据如Color、Depth等都能够从On-Chip芯片中取得，从而避免与系统内存进行缓慢的交互处理。此外，由于是按照tile来渲染的，每个tile中的像素数据的关联度远远高于整个屏幕空间中像素之间的关联度，导致在进行计算的时候，由于高关联度导致的cache miss也大大减少，从而提升了计算效率。

更详情的过程如下：

![IMR](/assets/images/mobile-game-opt/TBR2.png)

和IMR比，TBR主要是多了On-Chip Memory及Tiling。

Tiling会处理每个Drawcall的三角形面片。标记Tile与面片的覆盖关系，储存到primitive list 中。

![Tile Triangle A](/assets/images/mobile-game-opt/Tile1.png)

![Tile Triangle B](/assets/images/mobile-game-opt/Tile2.png)

以OpenGL/OpenGLES为例，调用完所有Drawcall后，最后会调用eglswapbuffer来完成一帧的渲染。此时GPU将依次处理每个Tile，将Tile中所有的面片处理完后，会把渲染完的数据推送到Frame Buffer，而后再处理下一个Tile。




参考：

 <a name="r1">[《GPU 架構 淺談 : IMR, TBR, TBDR》](http://wycwang.blogspot.com/2021/09/ )</a>

  <a name="r2">[《Tile-based Rendering Architecture（TBR/TBDR）》](https://www.jianshu.com/p/ffb7f9c13c3d )</a>
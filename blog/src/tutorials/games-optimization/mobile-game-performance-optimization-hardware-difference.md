---
title: 1分钟简单了解PC与移动端硬件差异(2)
icon: article
description: 
category:
  - 教程
tag:
  - game
star: false
---

在上一篇[文章](/tutorials/games/mobile-game-performance-optimization.html)中，我们谈到可以从硬件的角度入手性能优化。然而由于移动端的硬件和PC端是不同的，某些在PC和主机平台上运行良好的编程技术可能无法很好地移植到移动设备上。因此我们要简单了解PC与移动端的硬件差异。

![pc](/assets/images/mobile-game-opt/pc-architecture.png)

下面说一些基本概念：

- CPU 

  相比GPU来说，CPU有复杂的控制单元，可以处理复杂的计算逻辑。并且有比较多的Cache。

- FLOPS与内存带宽
  
  FLOPS指每秒浮点运算次数，理解为计算速度。一个普通的CPU每秒约能处理数千G的数据，而临近的内存每秒能传输数十G的数据。因此数据读取的延迟是非常高的。能否充分利用CPU与Cache的命中率有很大的关系。

- GPU 
  
  与CPU不同，GPU有非常多的ALU计算单元，但没有复杂的逻辑单元，因此GPU非常适合做简单的批量计算，在不同的数据上执行相同的代码逻辑（如Vertex Shader，Pixel Shader）。这意味着GPU的计算吞吐量大。
  

- Video DRAM

  显存，用于储存显示设备及图形计算所需要的数据，包括Frame Buffer, Texture data, Geometry data等。VRAM设计的目的是保证图形显示顺畅平滑。系统的内存与显存通过PCIe交换数据。

- PCIe
  
  一种高带宽扩展总线，通常用于连接显卡和 SSD，以及采集卡和无线网卡等外围设备。

![mobile-SOC](/assets/images/mobile-game-opt/mobile-soc.png)






造成桌面端与移动端设备存在区别的主要原因之一是功耗。与桌面端不同，移动端上使用统一的内存架构，（没有独立显存）。CPU和GPU都通过总线来访问共用的LPDDR物理内存（也称System Memory）。

移动端通常使用把CPU、GPU、内存、通信基带、GPS模块等整合在一起的芯片。这样的芯片称作SOC（System On Chip）。SOC有着降低耗电量，减少体积，提高速度等优势。

- Low Power Double Data Rate DRAM
  
  简称LPDDR（Low Power Double Data Rate）是移动设备常用的一种低功耗SDRAM，以低功耗和小体积著称，专用于移动电子产品。


---
title: 深入了解手游性能优化
icon: article
description: 
category:
  - 教程
tag:
  - game
star: false
---


优化不能无的放矢，需要有总体的规划和方法论。一般而言，从物理维度切入，优化可以从这三个物理硬件入手：

- CPU
- GPU
- 内存

进而可以更有针对性地进行性能优化：

- 渲染状态改变
- Game Logic
- 复杂渲染指令
- 高顶点数
- 大量贴图采样
- 大量场景物体加载
- 大量Render Texture

![overview](/assets/images/mobile-game-opt/overview.png)

对于刚入门游戏开发的朋友，上图可能有些名次可能有些陌生，下面列出部分比较容易陌生的名词的简单解释：

- Overview
- Render Texture

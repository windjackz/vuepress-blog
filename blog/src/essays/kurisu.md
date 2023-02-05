---
title: Amadeus Kurisu 复刻计划！ V0.0.1 
icon: info
description: 命运石之门 Steins;Gate Amadeus Kurisu 复刻计划！
category:
  - 风言风语
tag:
  - machine learning
head:
  - [script, { src: "/assets/live2d/lib/live2d.min.js" }]
  - [script, { src: "/assets/live2d/lib/live2dcubismcore.js" }]
star: true
---
<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
const Kurisu = defineAsyncComponent(() => import('@Kurisu'))
</script>

<ClientOnly>
<Kurisu />
</ClientOnly>

## 修改日志

### 0.0.1

### Features

- **animate:** add kurisu live2d
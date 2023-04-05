---
title: Amadeus Kurisu 复刻计划！ V0.6.1
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
import 'vant/lib/index.css';
import '@vant/touch-emulator';
const Kurisu = defineAsyncComponent(() => import('@Kurisu'))
</script>

::: center
<ClientOnly>
<Kurisu />
</ClientOnly>
:::

## 修改日志

### 0.6.0 (2023-04-05)

### Features

- **interact:** sing amadeus 

### 0.5.0 (2023-03-19)

### Features

- **interact:** AI role play kurisu 

### 0.4.0 (2023-03-17)

### Features

- **interact:** add chat panel

### 0.3.0 (2023-02-26)

### Features

- **sound:** add kurisu VITS

### 0.2.0 

### Features

- **animate:** live2d lipSync audio and mouth 

### 0.1.0 

### Features

- **components:** add live2d debugger editor

### 0.0.1

### Features

- **animate:** add kurisu live2d

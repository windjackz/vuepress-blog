import { defineUserConfig } from "vuepress";
import { viteBundler } from '@vuepress/bundler-vite'
import { searchPlugin } from "@vuepress/plugin-search";
import { getDirname, path } from "@vuepress/utils";
import { googleAnalyticsPlugin } from '@vuepress/plugin-google-analytics'
import theme from "./theme.js";


const __dirname = getDirname(import.meta.url);




export default defineUserConfig({
  base: "/",

  locales: {
    "/": {
      lang: "zh-CN",
      title: "风小楼WindJack",
      description: "风小楼WindJack，Developer，专注于Web、游戏以及机器学习",
    },
  },

  theme,

  shouldPrefetch: false,

  plugins: [
    searchPlugin({
      locales: {
        "/": {
          placeholder: "搜索",
        },
      },
    }),
    googleAnalyticsPlugin({
      // 配置项
      id: 'G-EQL7KBR36G',
    }),
  ],

  alias: {
    "@WaterEffectFinal": path.resolve(__dirname, "components/waterEffects/final.vue"),
    "@WaterEffectWave": path.resolve(__dirname, "components/waterEffects/wave.vue"),
    "@WaterEffectCaustic": path.resolve(__dirname, "components/waterEffects/caustic.vue"),
    "@StampDecodeImage": path.resolve(__dirname, "components/ask2see/decodeImg.vue"),
    "@StampEncodeImage": path.resolve(__dirname, "components/ask2see/encodeImg.vue"),
    "@ThemeYourName": path.resolve(__dirname, "components/theme/yourname.vue"),
    "@Kurisu": path.resolve(__dirname, "components/kurisu/index.vue"),
  },

  bundler: viteBundler({
    viteOptions: {
      optimizeDeps: {
        exclude: ["fsevents"],
      }
    },
  }),
});

import { defineUserConfig } from "vuepress";
import { searchPlugin } from "@vuepress/plugin-search";
import { getDirname, path } from "@vuepress/utils";
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
  ],

  alias: {
    "@WaterEffectFinal": path.resolve(__dirname, "components/waterEffects/final.vue"),
    "@WaterEffectWave": path.resolve(__dirname, "components/waterEffects/wave.vue"),
    "@WaterEffectCaustic": path.resolve(__dirname, "components/waterEffects/caustic.vue"),
  },
});

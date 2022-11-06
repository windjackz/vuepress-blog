import { defineUserConfig } from "vuepress";
import { searchPlugin } from "@vuepress/plugin-search";
import theme from "./theme.js";

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
});

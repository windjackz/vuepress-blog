import { sidebar } from "vuepress-theme-hope";

export const zhSidebar = sidebar({
  "/": [
    "",
    {
      text: "教程",
      icon: "creative",
      prefix: "tutorials/",
      link: "tutorials/",
      children: "structure",
    },
    {
      text: "游戏",
      icon: "note",
      link: "/games/",
    },
    "intro"
  ],
});

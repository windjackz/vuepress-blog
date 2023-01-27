<script setup lang="ts">
import { onMounted } from 'vue';

onMounted(() => {
  if (sessionStorage.getItem("theme") === "yourname") {
      document.querySelector("#app > div > div.page.blog > div.blog-hero.fullscreen > div")?.setAttribute('style', `background: url("/assets/images/bg_yourname.png") center center / cover no-repeat;`);
      const root = document.querySelector(':root');
      root?.setAttribute('style', '--theme-color: #226b9c;');
      document.querySelector("#app > div > header")?.setAttribute('style', `background: url("/assets/images/bg_yourname.png") center center / cover no-repeat;`);
  }
});
</script>
import { defineClientConfig } from '@vuepress/client'
import { Uploader, Field, Form, Button, Switch } from 'vant';
import { onMounted } from "vue";
export default defineClientConfig({
    enhance({ app, router, siteData }) {
        console.log('exec enhance');
        app.use(Uploader)
        .use(Field)
        .use(Form)
        .use(Button)
        .use(Switch);
    },
    setup() {
    },
    rootComponents: [],
})
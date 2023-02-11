import { defineClientConfig } from '@vuepress/client'
import { Uploader, Field, Form, Button, Switch, Popup, Icon } from 'vant';
import { Collapse, CollapseItem, Slider, Loading } from 'vant';

export default defineClientConfig({
    enhance({ app, router, siteData }) {
        app.use(Uploader)
        .use(Field)
        .use(Form)
        .use(Button)
        .use(Popup)
        .use(Icon)
        .use(Collapse)
        .use(CollapseItem)
        .use(Slider)
        .use(Loading)
        .use(Switch);
    },
    setup() {
    },
    rootComponents: [],
})
<template>
    <div class="monaco-editor" ref="editorRef"></div>
</template>

<script setup lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { onMounted, ref, Ref, reactive } from 'vue';
import { MonacoLanguageClient, MonacoServices } from 'monaco-languageclient';
import { CloseAction, ErrorAction, MessageTransports } from 'vscode-languageclient';
import normalizeUrl from 'normalize-url';
import { toSocket, WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc';

const apiDomain = 'https://19hevguuz2.execute-api.ap-northeast-1.amazonaws.com/Prod';
const API = {
    chat: `${apiDomain}/kurisu/chat`
}
let lspWebSocket: WebSocket;

const editorRef: Ref<HTMLElement | undefined> = ref();

const createUrl = (hostname: string, port: string, path: string): string => {
    const protocol = location.protocol === 'https:' ? 'wss' : 'ws';
    return normalizeUrl(`${protocol}://${hostname}:${port}${path}`);
}

const createWebSocket = (url: string) => {
    const webSocket = new WebSocket(url);
    webSocket.onopen = () => {
        const socket = toSocket(webSocket);
        const reader = new WebSocketMessageReader(socket);
        const writer = new WebSocketMessageWriter(socket);
        const languageClient = createLanguageClient({
            reader,
            writer
        });
        languageClient.start();
        reader.onClose(() => languageClient.stop());
    };
    return webSocket;
}

const createLanguageClient = (transports: MessageTransports): MonacoLanguageClient => {
    return new MonacoLanguageClient({
        name: 'Sample Language Client',
        clientOptions: {
            // use a language id as a document selector
            documentSelector: ['json'],
            // disable the default error handler
            errorHandler: {
                error: () => ({ action: ErrorAction.Continue }),
                closed: () => ({ action: CloseAction.DoNotRestart })
            }
        },
        // create a language client connection from the JSON RPC connection on demand
        connectionProvider: {
            get: () => {
                return Promise.resolve(transports);
            }
        }
    });
}

const registerEditor = () => {
    const hostname = '9.134.3.66';
    const path = '/python';
    const port = '2087';
    const url = createUrl(hostname, port, path);

    // register Monaco languages
    monaco.languages.register({
        id: 'json',
        extensions: ['.json', '.jsonc'],
        aliases: ['JSON', 'json'],
        mimetypes: ['application/json']
    });

    // create Monaco editor
    monaco.editor.create(editorRef.value!, {
        model: monaco.editor.createModel('', 'json', monaco.Uri.parse('inmemory://model.json')),
        glyphMargin: true,
        lightbulb: {
            enabled: true
        },
        automaticLayout: true
    });
    // install Monaco language client services
    MonacoServices.install();
    lspWebSocket = createWebSocket(url);
    
}

onMounted(async () => {
    registerEditor();
});

</script>

<style lang="scss" scoped>
.monaco-editor {
    width: 100%;
    height: 600px;
}
</style>
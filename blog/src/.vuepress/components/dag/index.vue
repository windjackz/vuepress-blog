<template>
    <div id="container"></div>
</template>
<script setup lang="ts">
import { onMounted } from 'vue';

const data = {
    nodes: [
        {
            id: 'node1',
            size: {
                width: 30,
                height: 30,
            },
            label: '1', 
        },
        {
            id: 'node2',
            size: {
                width: 30,
                height: 30,
            },
            label: '2', 
        },
        {
            id: 'node3',
            size: {
                width: 30,
                height: 30,
            },
            label: '3', 
        },
        {
            id: 'node4',
            size: {
                width: 30,
                height: 30,
            },
            label: '4', 
        },
        {
            id: 'node5',
            size: {
                width: 30,
                height: 30,
            },
            label: '5', 
        },
        {
            id: 'node6',
            size: {
                width: 30,
                height: 30,
            },
            label: '6', 
        },
        {
            id: 'node7',
            size: {
                width: 30,
                height: 30,
            },
            label: '7', 
        },
        {
            id: 'node8',
            size: {
                width: 30,
                height: 30,
            },
            label: '8', 
        },
        {
            id: 'node9',
            size: {
                width: 30,
                height: 30,
            },
            label: '9', 
        },
        {
            id: 'node10',
            size: {
                width: 30,
                height: 30,
            },
            label: '10', 
        },
        {
            id: 'node11',
            size: {
                width: 30,
                height: 30,
            },
            label: '11', 
        },
        {
            id: 'node12',
            size: {
                width: 30,
                height: 30,
            },
            label: '12', 
        },
        {
            id: 'node13',
            size: {
                width: 30,
                height: 30,
            },
            label: '13', 
        },
        {
            id: 'node14',
            size: {
                width: 30,
                height: 30,
            },
            label: '14', 
        },
        {
            id: 'node15',
            size: {
                width: 30,
                height: 30,
            },
            label: '15', 
        },
        {
            id: 'node16',
            size: {
                width: 30,
                height: 30,
            },
            label: '16', 
        },
        {
            id: 'node17',
            size: {
                width: 30,
                height: 30,
            },
            label: '17', 
        },
        {
            id: 'node18',
            size: {
                width: 30,
                height: 30,
            },
            label: '18', 
        },
        {
            id: 'node19',
            size: {
                width: 30,
                height: 30,
            },
            label: '19', 
        },
        {
            id: 'node20',
            size: {
                width: 30,
                height: 30,
            },
            label: '20', 
        },
        {
            id: 'node21',
            size: {
                width: 30,
                height: 30,
            },
            label: '21', 
        },
        {
            id: 'node22',
            size: {
                width: 30,
                height: 30,
            },
            label: '22', 
        },
        {
            id: 'node23',
            size: {
                width: 30,
                height: 30,
            },
            label: '23', 
        },
        {
            id: 'node24',
            size: {
                width: 30,
                height: 30,
            },
            label: '24', 
        },
        {
            id: 'node25',
            size: {
                width: 30,
                height: 30,
            },
            label: '25', 
        },
        {
            id: 'node26',
            size: {
                width: 30,
                height: 30,
            },
            label: '26', 
        },
        {
            id: 'node27',
            size: {
                width: 30,
                height: 30,
            },
            label: '27', 
        },
        {
            id: 'node28',
            size: {
                width: 30,
                height: 30,
            },
            label: '28', 
        },
        {
            id: 'node29',
            size: {
                width: 30,
                height: 30,
            },
            label: '29', 
        },
        {
            id: 'node30',
            size: {
                width: 30,
                height: 30,
            },
            label: '30', 
        },
        {
            id: 'node31',
            size: {
                width: 30,
                height: 30,
            },
            label: '31', 
        },
        {
            id: 'node32',
            size: {
                width: 30,
                height: 30,
            },
            label: '32', 
        },
        {
            id: 'node33',
            size: {
                width: 30,
                height: 30,
            },
            label: '33', 
        }
    ],
    edges: [
        {
            source: 'node1',
            target: 'node2',
        },
        {
            source: 'node1',
            target: 'node3',
        },
        {
            source: 'node2',
            target: 'node4',
        },
        {
            source: 'node3',
            target: 'node4',
        },
        {
            source: 'node4',
            target: 'node5',
        },
        {
            source: 'node6',
            target: 'node7',
        },
        {
            source: 'node7',
            target: 'node8',
        },
        {
            source: 'node8',
            target: 'node9',
        },
        {
            source: 'node8',
            target: 'node3',
        },
        {
            source: 'node9',
            target: 'node10',
        },
        {
            source: 'node9',
            target: 'node17',
        },
        {
            source: 'node10',
            target: 'node17',
        },
        {
            source: 'node12',
            target: 'node17',
        },
        {
            source: 'node8',
            target: 'node16',
        },
        {
            source: 'node10',
            target: 'node11',
        },
        {
            source: 'node11',
            target: 'node12',
        },
        {
            source: 'node12',
            target: 'node13',
        },
        {
            source: 'node13',
            target: 'node14',
        },
        {
            source: 'node14',
            target: 'node16',
        },
        {
            source: 'node14',
            target: 'node15',
        },
        {
            source: 'node16',
            target: 'node15',
        },
        {
            source: 'node15',
            target: 'node18',
        },
        {
            source: 'node19',
            target: 'node20',
        },
        {
            source: 'node19',
            target: 'node23',
        },
        {
            source: 'node19',
            target: 'node24',
        },
        {
            source: 'node20',
            target: 'node21',
        },
        {
            source: 'node23',
            target: 'node21',
        },
        {
            source: 'node24',
            target: 'node21',
        },
        {
            source: 'node20',
            target: 'node25',
        },
        {
            source: 'node23',
            target: 'node25',
        },
        {
            source: 'node24',
            target: 'node25',
        },
        {
            source: 'node21',
            target: 'node26',
        },
        {
            source: 'node25',
            target: 'node26',
        },
        {
            source: 'node26',
            target: 'node27',
        },
        {
            source: 'node27',
            target: 'node28',
        },
        {
            source: 'node28',
            target: 'node29',
        },
        {
            source: 'node29',
            target: 'node30',
        },
        {
            source: 'node30',
            target: 'node31',
        },
        {
            source: 'node31',
            target: 'node32',
        },
        {
            source: 'node32',
            target: 'node33',
        },

    ]
};

onMounted(async () => {
    const allScripts: Promise<unknown>[] = [];
    const createScriptPromise = (url: string) => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = () => resolve(null);
            document.body.appendChild(script);
        });
    }
    allScripts.push(createScriptPromise('/assets/x6/x6.js'), createScriptPromise('/assets/x6/layout.min.js'));
    await Promise.all(allScripts);
    const { Graph, Addon } = (window as any).X6;
    const { GridLayout, DagreLayout } = (window as any).layout;
    const graph = new Graph({
        container: document.getElementById('container'),
        width: 800,
        height: 600,
        scroller: {
            enabled: true,
        },
        mousewheel: {
            enabled: true,
            modifiers: ['ctrl', 'meta'],
        },
    });
    const gridLayout = new GridLayout({
        type: 'grid',
        width: 600,
        height: 400,
        center: [300, 200],
        rows: 4,
        cols: 4,
    });
    const dagreLayout = new DagreLayout({
        type: 'dagre',
        rankdir: 'TB',
        align: 'UL',
        ranksep: 30,
        nodesep: 15,
        controlPoints: true,
    })
    const newModel = dagreLayout.layout(data)
    console.log('newModel', newModel);
    graph.fromJSON(newModel)
});
</script>

<style lang="scss" scoped>
</style>
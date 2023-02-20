<template>
    <table>
        <tr>
            <td>前置关卡</td>
            <td>关卡id</td>
        </tr>
        <tr v-for="item in levelDependence">
            <td>{{ item.dependenceIds.join(',') }}</td>
            <td>{{ item.id }}</td>
        </tr>
    </table>
    <div id="container"></div>
    <button @click="onSave">save</button>
</template>
<script setup lang="ts">
import { onMounted, Ref, ref } from 'vue';
import { Cell, Graph } from "@antv/x6";
import { DagreLayout } from '@antv/layout'
import { Scroller } from "@antv/x6-plugin-scroller";
import { AStarFinder } from "astar-typescript-cost";

interface levelDependence {
    id: string;
    dependenceIds: string[]
}
const levelDependence: Ref<levelDependence[]> = ref([])

const data = {
    nodes: [],
    edges: [],
}

const initLevelDependence = () => {
    const values: levelDependence[] = [
        {
            id: '1',
            dependenceIds: []
        },
        {
            id: '2',
            dependenceIds: ['1']
        },
        {
            id: '3',
            dependenceIds: ['1']
        },
        {
            id: '4',
            dependenceIds: ['2', '3']
        },
        {
            id: '5',
            dependenceIds: ['4']
        },
        {
            id: '6',
            dependenceIds: []
        },
        {
            id: '7',
            dependenceIds: ['6']
        },
        {
            id: '8',
            dependenceIds: ['7']
        },
        {
            id: '9',
            dependenceIds: ['8']
        },
        {
            id: '10',
            dependenceIds: ['9']
        },
        {
            id: '11',
            dependenceIds: ['10']
        },
        {
            id: '12',
            dependenceIds: ['11']
        },
        {
            id: '13',
            dependenceIds: ['12']
        },
        {
            id: '14',
            dependenceIds: ['16']
        },
        {
            id: '15',
            dependenceIds: ['14', '16']
        },
        {
            id: '16',
            dependenceIds: ['14']
        },
        {
            id: '17',
            dependenceIds: ['9', '10', '12']
        },
        {
            id: '18',
            dependenceIds: ['15']
        },
        {
            id: '19',
            dependenceIds: []
        },
        {
            id: '20',
            dependenceIds: ['19']
        },
        {
            id: '21',
            dependenceIds: ['20', '23', '24']
        },
        {
            id: '22',
            dependenceIds: []
        },
        {
            id: '23',
            dependenceIds: ['19']
        },
        {
            id: '24',
            dependenceIds: ['19']
        },
        {
            id: '25',
            dependenceIds: ['20', '23', '24']
        },
        {
            id: '26',
            dependenceIds: ['21', '25']
        },
        {
            id: '27',
            dependenceIds: ['26']
        },
        {
            id: '28',
            dependenceIds: ['27']
        },
        {
            id: '29',
            dependenceIds: ['28']
        },
        {
            id: '30',
            dependenceIds: ['29']
        },
        {
            id: '31',
            dependenceIds: ['30']
        },
        {
            id: '32',
            dependenceIds: ['31']
        },
        {
            id: '33',
            dependenceIds: ['32']
        },
    ];
    levelDependence.value = values;
    const nodes = values.map((item) => {
        return {
            id: item.id,
            size: {
                width: eleSize,
                height: eleSize,
            },
            label: item.id, 
            zIndex: 20
        }
    });
    data.nodes = nodes;
    const edges: { source: string; target: string }[] = [];
    values.forEach((item) => {
        if (item.dependenceIds.length) {
            item.dependenceIds.forEach((denpendence) => {
                edges.push({
                    target: item.id,
                    source: denpendence
                });
            });
        }
    });
    data.edges = edges;
    debugger;
}

const grideSize = 94;
const eleSize = grideSize / 2;
const gapSize = (grideSize - eleSize) / 2;
/* const data = {
    nodes: [
        {
            id: '1',
            size: {
                width: eleSize,
                height: eleSize,
            },
            label: '1', 
            zIndex: 20
        },
    ],
    edges: [
        {
            source: '1',
            target: '2',
        },
        {
            source: '1',
            target: '3',
        },
        {
            source: '2',
            target: '4',
        },
        {
            source: '3',
            target: '4',
        },
        {
            source: '4',
            target: '5',
        },
        {
            source: '6',
            target: '7',
        },
        {
            source: '7',
            target: '8',
        },
        {
            source: '8',
            target: '9',
        },
        {
            source: '8',
            target: '3',
        },
        {
            source: '9',
            target: '10',
        },
        {
            source: '9',
            target: '17',
        },
        {
            source: '10',
            target: '17',
        },
        {
            source: '12',
            target: '17',
        },
        {
            source: '8',
            target: '16',
        },
        {
            source: '10',
            target: '11',
        },
        {
            source: '11',
            target: '12',
        },
        {
            source: '12',
            target: '13',
        },
        {
            source: '13',
            target: '14',
        },
        {
            source: '14',
            target: '16',
        },
        {
            source: '14',
            target: '15',
        },
        {
            source: '16',
            target: '15',
        },
        {
            source: '15',
            target: '18',
        },
        {
            source: '19',
            target: '20',
        },
        {
            source: '19',
            target: '23',
        },
        {
            source: '19',
            target: '24',
        },
        {
            source: '20',
            target: '21',
        },
        {
            source: '23',
            target: '21',
        },
        {
            source: '24',
            target: '21',
        },
        {
            source: '20',
            target: '25',
        },
        {
            source: '23',
            target: '25',
        },
        {
            source: '24',
            target: '25',
        },
        {
            source: '21',
            target: '26',
        },
        {
            source: '25',
            target: '26',
        },
        {
            source: '26',
            target: '27',
        },
        {
            source: '27',
            target: '28',
        },
        {
            source: '28',
            target: '29',
        },
        {
            source: '29',
            target: '30',
        },
        {
            source: '30',
            target: '31',
        },
        {
            source: '31',
            target: '32',
        },
        {
            source: '32',
            target: '33',
        },

    ]
}; */

const convertNodePoint = (row: number, column: number) => {
    return {
        x: column * 2 + 1,
        y: row * 2 + 1
    }
}

/* for (let i = 2; i <= 33; i += 1) {
    data.nodes.push({
        id: `${i}`,
        size: {
            width: eleSize,
            height: eleSize,
        },
        label: `${i}`,
        zIndex: 20,
    });
} */

let sdata: {
    cells: any;
} | undefined = undefined;
let graph: Graph | undefined;

const getRowColumn = (node) => {
        const grideRow = Math.floor(node.y / grideSize);
        const grideColumn = Math.floor(node.x / grideSize);
        return {
            row: grideRow,
            column: grideColumn
        }
    }

const updatePosition = (node, row: number, column: number) => {
    node.y = row * 94 + gapSize;
    node.x = column * 94 + gapSize;
}

onMounted(async () => {
    initLevelDependence();
    graph = new Graph({
        container: document.getElementById('container')!,
        width: 800,
        height: 600,
        mousewheel: {
            enabled: true,
            modifiers: ['ctrl', 'meta'],
        },
        grid: {
            size: grideSize / 2,      // 网格大小 10px
            visible: true, // 渲染网格背景
        },
        background: {
            image: "/assets/images/dag/background.png",
            position: "top left", // https://developer.mozilla.org/en-US/docs/Web/CSS/background-position
            size: "auto auto", // https://developer.mozilla.org/en-US/docs/Web/CSS/background-size
            repeat: "repeat", // https://developer.mozilla.org/en-US/docs/Web/CSS/background-repeat
        },
        // panning: true,
    });
    graph.use(
        new Scroller({
            graph,
            pannable: true,
            /* background: {
                image: "/assets/images/dag/background.png",
                position: "top left", // https://developer.mozilla.org/en-US/docs/Web/CSS/background-position
                size: "auto auto", // https://developer.mozilla.org/en-US/docs/Web/CSS/background-size
                repeat: "repeat", // https://developer.mozilla.org/en-US/docs/Web/CSS/background-repeat
            }, */
        })
    );
    const gridLayout = new DagreLayout({
        type: 'dagre',
        // begin: [0, 0],
        rankdir: 'LR',
        align: 'UL',
        ranksep: gapSize ,
        nodesep: gapSize ,
        controlPoints: true,
    })
    const newModel = gridLayout.layout(data);

    const newData = {
        /* edges: newModel.edges?.map((edge) => {
            return {
                ...edge,
                router: {
                    name: "manhattan",
                    step: grideSize
                },
                attrs: {
                    line: {
                        targetMarker: null,
                        strokeDasharray: 5,
                        stroke: '#1890ff',
                        opacity: 0.4
                    }
                },
                connector: {
                    name: 'jumpover',
                    args: {
                    type: 'arc',
                    },
                },
            }
        }), */
        nodes: newModel.nodes,
    };
    // (newModel!.nodes![0] as any).y = gapSize;
    // (newModel!.nodes![0] as any).x = gapSize;
    
    const findMinLeftNode = (nodes?: any[]) => {
        const nodesOrder = (nodes || newModel.nodes)?.slice().sort((nodeA, nodeB) => {
            return (nodeA as any).x - (nodeB as any).x;
        });
        return nodesOrder?.filter((node) => (node as any).x === (nodesOrder[0] as any).x);
    }
    const findMaxRightNode = (nodes?: any[]) => {
        const nodesOrder = (nodes || newModel.nodes)?.slice().sort((nodeA, nodeB) => {
            return (nodeB as any).x - (nodeA as any).x;
        });
        return nodesOrder?.filter((node) => (node as any).x === (nodesOrder[0] as any).x);
    }
    const findMaxBottomNode = (nodes?: any[]) => {
        const nodesOrder = (nodes || newModel.nodes)?.slice().sort((nodeA, nodeB) => {
            return (nodeB as any).y - (nodeA as any).y;
        });
        return nodesOrder?.filter((node) => (node as any).x === (nodesOrder[0] as any).x);
    }
    const findMinTopNode = (nodes?: any[]) => {
        const nodesOrder = (nodes || newModel.nodes)?.slice().sort((nodeA, nodeB) => {
            return (nodeA as any).y - (nodeB as any).y;
        });
        return nodesOrder?.filter((node) => (node as any).y === (nodesOrder[0] as any).y);
    }
    const minLeftNode = findMinLeftNode()![0];
    const minYNode = findMinLeftNode(findMinTopNode())![0];
    const maxRightNode = findMaxRightNode()![0];
    const maxYNode = findMaxRightNode(findMaxBottomNode())![0];

    console.log(minLeftNode);
    console.log(minYNode);
    console.log(maxRightNode);
    console.log(maxYNode);
    // 设置到左上角
    const minX = minLeftNode.x;
    const minY = minYNode.y;
    const minXGap = minX - gapSize;
    const minYGap = minY - gapSize;

    newModel.nodes?.forEach((node) => {
        (node as any).x -= minXGap
    });

    newModel.nodes?.forEach((node) => {
        (node as any).y -= minYGap
    });
    // newModel.nodes![0].x = newModel.nodes![0].y = gapSize;
    // 分配格子
    const noedesMap = new Map();
    newModel.nodes?.forEach((node) => {
        const rc = getRowColumn(node);
        const grideRow = rc.row;
        const grideColumn = rc.column;
        node.row = grideRow;
        node.column = grideColumn;
        updatePosition(node, rc.row, rc.column);
        noedesMap.set(node.id, node);
    });
    console.log(newModel);
    graph.fromJSON(newData);
    console.log(newData);
    graph.on('cell:mouseleave', ({ cell }) => {
        cell.removeTools()
    })
    graph.on('cell:mouseenter', ({ cell }) => {
        /* if (cell.isNode()) {
            cell.addTools([
            {
                name: 'boundary',
                args: {
                attrs: {
                    fill: '#7c68fc',
                    stroke: '#333',
                    'stroke-width': 1,
                    'fill-opacity': 0.2,
                },
                },
            },
            {
                name: 'button-remove',
                args: {
                x: 0,
                y: 0,
                offset: { x: 10, y: 10 },
                },
            },
            ])
        } else {
            cell.addTools(['vertices', 'segments'])
        } */
        if (cell.isEdge()) {
            console.log(cell.id, cell.getVertices());
            // console.log();
            cell.addTools([{
                name: 'segments',
                    args: {
                    snapRadius: 20,
                    attrs: {
                        fill: '#444',
                    },
                },
            }])
        } else if (cell.isNode()) {
            const data = noedesMap.get(cell.id);
            console.log(cell.id, {
                row: data.row,
                column: data.column,
            });
            const convert = convertNodePoint(
                data.row,
                data.column,
            );
            console.log(cell.id, {
                x: convert.x,
                y: convert.y,
            });
            cell.addTools([
                {
                    name: 'boundary',
                    args: {
                    attrs: {
                        fill: '#7c68fc',
                        stroke: '#333',
                        'stroke-width': 1,
                        'fill-opacity': 0.2,
                    },
                    },
                },
            ])
        }
    })

    const mapRect = [minYNode.row, minLeftNode.column, maxYNode.row, maxRightNode.column];
    // 一个格子 划分四个格子
    mapRect[2]  = (mapRect[2] + 1) * 2;
    mapRect[3] = (mapRect[3] + 1) * 2;
    const costMap: number[][] = [];
    for (let i = 0; i <= mapRect[2]; i += 1) {
        costMap.push([]);
        for (let j = 0; j < mapRect[3] + 1; j += 1) {
            costMap[i].push(0);
        }
    }

    data.nodes.forEach((node) => {
        const position = convertNodePoint(node.row, node.column);
        costMap[position.y][position.x] = 1;
    });

    console.log('costMap \n: ', JSON.stringify(costMap));

    const pathMap = new Map();

    const refreshEdge = () => {
        graph?.removeCells(graph?.getEdges());
        console.log(JSON.stringify(costMap));
            // 计算每条边的路径
        data.edges.forEach((edgeData) => {
            const sourceNodedata = noedesMap.get(edgeData.source);
            const targetNodedata = noedesMap.get(edgeData.target);
            const sourceConvertNode = convertNodePoint(sourceNodedata.row, sourceNodedata.column);
            const targetConvertNode = convertNodePoint(targetNodedata.row, targetNodedata.column);
            // 打开起点和终点的路径
            costMap[sourceConvertNode.y][sourceConvertNode.x] = 0;
            costMap[targetConvertNode.y][targetConvertNode.x] = 0;
            const aStarInstance = new AStarFinder({
                grid: {
                    matrix: costMap,
                },
                heuristic: "Manhattan",
                diagonalAllowed: false
            });
            const findPath = aStarInstance.findPath(sourceConvertNode, targetConvertNode);
            pathMap.set(edgeData, findPath);
            // 关闭起点和终点的路径
            costMap[sourceConvertNode.y][sourceConvertNode.x] = 1;
            costMap[targetConvertNode.y][targetConvertNode.x] = 1;
        });
        // 添加边
            data.edges.forEach((edgeData) => {
            const path = pathMap.get(edgeData) as number[][];
            const sourceNode = path[0];
            const targetNode = path[path.length - 1];
            const sourcePosition = {
                x: sourceNode[0] * grideSize / 2,
                y: sourceNode[1] * grideSize / 2,
            }
            const targetPosition = {
                x: targetNode[0] * grideSize / 2,
                y: targetNode[1] * grideSize / 2,
            }
            const vertices = path.map((node) => {
                return {
                    x: node[0] * grideSize / 2,
                    y: node[1] * grideSize / 2,
                }
            });
            vertices.shift(); // 去掉终点以及起点
            vertices.pop();
            graph?.addEdge({
                source: sourcePosition,
                target: targetPosition,
                vertices,
                attrs: {
                    line: {
                        targetMarker: null,
                        strokeDasharray: 5,
                        stroke: '#1890ff',
                        opacity: 0.4
                    }
                },
                /* connector: {
                    name: 'jumpover',
                    args: {
                        type: 'arc',
                        size: 4,
                    },
                }, */
                zIndex: 10,
            });
            /*  for (let i = 0; i < path.length - 1; i += 1) {
                    const sourceNode = path[i];
                    const targetNode = path[i + 1];
                    const sourcePosition = {
                        x: sourceNode[0] * grideSize / 2,
                        y: sourceNode[1] * grideSize / 2,
                    }
                    const targetPosition = {
                        x: targetNode[0] * grideSize / 2,
                        y: targetNode[1] * grideSize / 2,
                    }
                    debugger;
                    graph.addEdge({
                        source: sourcePosition,
                        target: targetPosition,
                        attrs: {
                            line: {
                                targetMarker: null,
                                strokeDasharray: 5,
                                stroke: '#1890ff',
                                opacity: 0.4
                            }
                        },
                        zIndex: 10,
                    });
                }*/
            });   
    }

    refreshEdge();

    graph.on('node:mousemove', ({ e, x, y, node, view }) => { 
        const data = noedesMap.get(node.id);
        const currentPosition = node.getPosition();
        const rc = getRowColumn(currentPosition);
        if (data.row !== rc.row || data.column !== rc.column) {
            const sourceConvertNode = convertNodePoint(data.row, data.column);
            const targetConvertNode = convertNodePoint(rc.row, rc.column);
            costMap[sourceConvertNode.y][sourceConvertNode.x] = 0;
            costMap[targetConvertNode.y][targetConvertNode.x] = 0;
            console.log('refresh');
            setTimeout(() => {
                refreshEdge();
            }, 0);
        }
        data.row = rc.row;
        data.column = rc.column;
        updatePosition(data, rc.row, rc.column);
        node.position(data.x, data.y);
    })

});

const onSave = () => {
    sdata = graph!.toJSON();
    console.log(graph!.toJSON());
    graph?.clearCells();
    setTimeout(() => {
        graph?.fromJSON(sdata as any);
    }, 2000);
   
}
</script>

<style lang="scss" scoped>
</style>
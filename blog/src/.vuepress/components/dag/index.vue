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
    <div class="control-area">
        <button @click="onSave">save</button>
        <button @click="onSerialize">serialize</button>
    </div>
</template>
<script setup lang="ts">
import { onMounted, Ref, ref } from 'vue';
import { Cell, Edge, Graph, Point } from "@antv/x6";
import { DagreLayout, Model } from '@antv/layout'
import { Scroller } from "@antv/x6-plugin-scroller";
import { AStarFinder } from "astar-typescript-cost";
import { LevelDependence } from './interfaces';
import { mockDatas } from './mockData';

interface CustomNode { x: number; y: number; row?: number; column?: number };

// 关卡依赖关系
const levelDependence: Ref<LevelDependence[]> = ref([])

// 图数据
const data: {
    nodes: {
        id: string; 
        size?: { width: number, height: number }
        row?: number;
        column?: number;
        x?: number;
        y?: number;
    }[];
    edges: {
        source: string;
        target: string;
    }[];
} = {
    nodes: [],
    edges: [],
}

const noedesMap: Map<any, {
        id: string; 
        size?: { width: number, height: number }
        row?: number;
        column?: number;
        x?: number;
        y?: number;
}> = new Map();
    
const edgesMap: Map<any, Edge<Edge.Properties>> = new Map();

let graph: Graph | undefined;

// 网格大小
const grideSize = 94;
const eleSize = grideSize / 2;
const gapSize = (grideSize - eleSize) / 2;

// DAG图
const costMap: number[][] = [];

const initLevelDependence = () => {
    const values: LevelDependence[] = mockDatas;
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
}

const initGraph = () => {
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
}

const layoutNodes = () => {
    const gridLayout = new DagreLayout({
        type: 'dagre',
        // begin: [0, 0],
        rankdir: 'LR',
        align: 'UL',
        ranksep: gapSize ,
        nodesep: gapSize ,
        controlPoints: true,
    })
    return gridLayout.layout(data);
}

// 转换网格row column坐标到 DAG图坐标
const convertNodePoint = (row: number, column: number) => {
    return {
        x: column * 2 + 1,
        y: row * 2 + 1
    }
}

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

const moveGraphToLeftTop = (minLeftNode: CustomNode, minYNode: CustomNode, model: Model) => {
    // 设置到左上角
    const minX = minLeftNode.x;
    const minY = minYNode.y;
    const minXGap = minX - gapSize;
    const minYGap = minY - gapSize;

    model.nodes?.forEach((node) => {
        (node as unknown as CustomNode).x -= minXGap
    });

    model.nodes?.forEach((node) => {
        (node as unknown as CustomNode).y -= minYGap
    });
}

// 分配格子到row column
const assignNodeToGrid = (model: Model) => {
    model.nodes?.forEach((node) => {
        const rc = getRowColumn(node);
        const grideRow = rc.row;
        const grideColumn = rc.column;
        (node as unknown as CustomNode).row = grideRow;
        (node as unknown as CustomNode).column = grideColumn;
        updatePosition(node, rc.row, rc.column);
        noedesMap.set(node.id, node);
    });
}

const initGraphListener = (graph: Graph) => {
    graph!.on('cell:mouseleave', ({ cell }) => {
        cell.removeTools()
    })
    graph!.on('cell:mouseenter', ({ cell }) => {
        if (cell.isEdge()) {
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
            const data = noedesMap.get(cell.id)!;
            console.log(cell.id, {
                row: data.row,
                column: data.column,
            });
            const convert = convertNodePoint(
                data.row!,
                data.column!,
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
    graph!.on('node:mousemove', ({ e, x, y, node, view }) => { 
        const data = noedesMap.get(node.id)!;
        const currentPosition = node.getPosition();
        const rc = getRowColumn(currentPosition);
        if (data.row !== rc.row || data.column !== rc.column) {
            const sourceConvertNode = convertNodePoint(data.row!, data.column!);
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
        node.position(data.x!, data.y!);
    })
}

const initCostMap = (minLeftNode: CustomNode, minYNode: CustomNode, maxRightNode: CustomNode, maxYNode: CustomNode) => {
    const mapRect = [minYNode.row, minLeftNode.column, maxYNode.row, maxRightNode.column];
    // 一个格子 划分四个格子
    mapRect[2]  = (mapRect[2]! + 1) * 2;
    mapRect[3] = (mapRect[3]! + 1) * 2;
    
    for (let i = 0; i <= mapRect[2]; i += 1) {
        costMap.push([]);
        for (let j = 0; j < mapRect[3] + 1; j += 1) {
            costMap[i].push(0);
        }
    }

    data.nodes.forEach((node) => {
        const position = convertNodePoint(node.row!, node.column!);
        costMap[position.y][position.x] = 1;
    });
}

onMounted(async () => {
    initLevelDependence();
    initGraph();
    const model = layoutNodes();

    const minLeftNode = findMinLeftNode(model.nodes as unknown as CustomNode[])![0];
    const minYNode = findMinLeftNode(findMinTopNode(model.nodes as unknown as CustomNode[]))![0];
    const maxRightNode = findMaxRightNode(model.nodes as unknown as CustomNode[])![0];
    const maxYNode = findMaxRightNode(findMaxBottomNode(model.nodes as unknown as CustomNode[]))![0];

    moveGraphToLeftTop(minLeftNode, minYNode, model);
    assignNodeToGrid(model);
    initCostMap(minLeftNode, minYNode, maxRightNode, maxYNode);


    graph!.fromJSON(model);

    initGraphListener(graph!);

    refreshEdge();

});

// 生成线
const refreshEdge = () => {
    const pathMap = new Map();
    graph?.removeCells(graph?.getEdges());
    edgesMap.clear();
    console.log(JSON.stringify(costMap));
        // 计算每条边的路径
    data.edges.forEach((edgeData) => {
        const sourceNodedata = noedesMap.get(edgeData.source);
        const targetNodedata = noedesMap.get(edgeData.target);
        const sourceConvertNode = convertNodePoint(sourceNodedata!.row!, sourceNodedata!.column!);
        const targetConvertNode = convertNodePoint(targetNodedata!.row!, targetNodedata!.column!);
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
        const edgeCell = graph!.addEdge({
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
        edgesMap.set(edgeData, edgeCell);    
    }); 
    pathMap.clear();  
}

const findMinLeftNode = (nodes: CustomNode[]) => {
        const nodesOrder = nodes.slice().sort((nodeA, nodeB) => {
            return nodeA .x - nodeB.x;
        });
        return nodesOrder?.filter((node) => node.x === nodesOrder[0].x);
    }
const findMaxRightNode = (nodes: CustomNode[]) => {
    const nodesOrder = nodes.slice().sort((nodeA, nodeB) => {
        return nodeB.x - nodeA.x;
    });
    return nodesOrder?.filter((node) => node.x === nodesOrder[0].x);
}
const findMaxBottomNode = (nodes: CustomNode[]) => {
    const nodesOrder = nodes.slice().sort((nodeA, nodeB) => {
        return nodeB.y - nodeA.y;
    });
    return nodesOrder?.filter((node) => node.x === nodesOrder[0].x);
}
const findMinTopNode = (nodes: CustomNode[]) => {
    const nodesOrder = nodes.slice().sort((nodeA, nodeB) => {
        return nodeA.y - nodeB.y;
    });
    return nodesOrder?.filter((node) => node.y === nodesOrder[0].y);
}

const onSave = () => {
    const graphData = graph!.toJSON();
    // todo 编辑器图形数据
}

// 关卡序列化数据
const onSerialize = () => {
    const result: {
        nodes: { id: string; x: number; y: number }[];
        links: { fromNodeId: string; toNodeId: string; path: number[][] }[],
    } = {
        nodes: [],
        links: [],
    }
    result.nodes = data.nodes.map((node) => {
        const cn = convertNodePoint(node.row!, node.column!);
        return {
            id: node.id,
            x: cn.x,
            y: cn.y,
        }
    });
    result.links = data.edges.map((edgeData) => {
        const edgeCell = edgesMap.get(edgeData)!;
        const points: Point[] = [];
        points.push(edgeCell.getSourcePoint());
        points.push(...edgeCell.getVertices());
        points.push(edgeCell.getTargetPoint());
        return {
            fromNodeId: edgeData.source,
            toNodeId: edgeData.target,
            path: points.map((point) => {
                return [Math.floor(point.x / (grideSize * 0.5)), Math.floor(point.y / (grideSize * 0.5))]
            })
        }
    });
    const fileName = `levelLayout.json`;
    downloadData(fileName, strToBlob(JSON.stringify(result)));
}

// 下载文件
const downloadData = (name: string, file: Blob) => {
  const objectUrl = window.URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = name;
  a.click();
  a.remove();
};

const strToBlob = (str: string) => new Blob([str]);

</script>

<style lang="scss" scoped>
.control-area {
    margin-top: 10px;
    button + button {
        margin-left: 10px;
    }
} 
</style>
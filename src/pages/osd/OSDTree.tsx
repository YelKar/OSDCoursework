import VisTree from "../../VisTree/VisTree";
import styles from "./OSD.common.module.css";
import React, {RefObject, useContext, useEffect} from "react";
import {CanvasProps} from "./OSDCanvases";
import {assertExists, getCSSVariable} from "../../utils/util";
import {OSDContext} from "./OSD";
import {DataSet} from "vis-data";
import {Edge, Node} from "vis-network";
import {HSTEdge, HSTNode, HSTTree} from "./algorithm/types";


export default function OSDTree(
    {
        ...style
    }: CanvasProps) {
    const {
        treeRef: [,tree,],
    } = assertExists(useContext(OSDContext));
    const nodesRef = React.useRef<DataSet<Node>>(new DataSet<Node>([]));
    const edgesRef = React.useRef<DataSet<Edge>>(new DataSet<Edge>([]));

    useEffect(() => {
        convertTreeToVis(tree, nodesRef, edgesRef);
    }, [tree]);

    return (
        <VisTree
            nodes={nodesRef.current}
            edges={edgesRef.current}
            className={styles.canvas}
            style={{
                left: style.pos.x + "px",
                top: style.pos.y + "px",
                height: style.size.height + "px",
                width: style.size.width + "px",
            }}
            defaultScale={0.1}
        />
    )
}

// function convertTreeToVis(tree: HSTTree, nodesRef: RefObject<DataSet<Node>>, edgesRef: RefObject<DataSet<Edge>>): void {
//     const getNodeNumberByPos = (pos: MarkedPoint) => {
//         return tree.nodes.findIndex((p) => p.point.id === pos.id);
//     };
//     nodesRef.current.clear();
//     edgesRef.current.clear();
//     for (const edge of tree.edges) {
//         if (!nodesRef.current.get(getNodeNumberByPos(edge.from))) {
//             const label = tree.nodes[getNodeNumberByPos(edge.from)].label.indexOf(":") === -1 ? tree.nodes[getNodeNumberByPos(edge.from)].label : "";
//             nodesRef.current.add({id: getNodeNumberByPos(edge.from), label});
//         }
//         if (!nodesRef.current.get(getNodeNumberByPos(edge.to))) {
//             const label = tree.nodes[getNodeNumberByPos(edge.to)].label.indexOf(":") === -1 ? tree.nodes[getNodeNumberByPos(edge.to)].label : "";
//             nodesRef.current.add({id: getNodeNumberByPos(edge.to), label});
//         }
//         edgesRef.current.add({
//             from: getNodeNumberByPos(edge.from),
//             to: getNodeNumberByPos(edge.to),
//             length: edge.length,
//             label: edge.value?.toFixed(2),
//         });
//     }
// }

function getEdgeIndexByNodeIds(edges: HSTEdge[], from: number | string, to: number | string) {
    return edges.findIndex((e) => e.from.id === from && e.to.id === to);
}
function getNodeIndexById(nodes: HSTNode[], id: number | string) {
    return nodes.findIndex((n) => n.point.id === id);
}
function getEdgeColor(edge: HSTEdge) {
    return (edge.value ?? 0) >= edge.length ? getCSSVariable("--accent-color") : getCSSVariable("--secondary-color");
}

function convertTreeToVis(tree: HSTTree, nodesRef: RefObject<DataSet<Node>>, edgesRef: RefObject<DataSet<Edge>>): void {
    const visEdges = edgesRef.current.get();
    const edges = [...tree.edges];
    for (const visEdge of visEdges) {
        if (!visEdge.from || !visEdge.to) {
            continue;
        }
        const edgeIndex = getEdgeIndexByNodeIds(edges, visEdge.from, visEdge.to);
        const edge = edges[edgeIndex];
        if (edge === undefined) {
            edgesRef.current.remove(visEdge);
            continue;
        }
        edgesRef.current.update({
            id: edge.from.id + "-" + edge.to.id,
            from: edge.from.id,
            to: edge.to.id,
            length: edge.length,
            label: edge.value?.toFixed(1),
            color: getEdgeColor(edge),
        })
        edges.splice(edgeIndex, 1);
    }
    for (const edge of edges) {
        edgesRef.current.add({
            id: edge.from.id + "-" + edge.to.id,
            from: edge.from.id,
            to: edge.to.id,
            length: edge.length,
            label: edge.value?.toFixed(1),
            color: getEdgeColor(edge),
        });
    }
    const visNodes = nodesRef.current.get();
    const nodes = [...tree.nodes];
    for (const visNode of visNodes) {
        if (!visNode.id) {
            continue;
        }
        const nodeIndex = getNodeIndexById(nodes, visNode.id);
        const node = nodes[nodeIndex];
        if (node === undefined) {
            nodesRef.current.remove(visNode);
            continue;
        }
        nodesRef.current.update({
            id: node.point.id,
            label: node.label.indexOf(":") === -1 && node.label !== "root" ? node.label : "",
        });
        nodes.splice(nodeIndex, 1);
    }
    for (const node of nodes) {
        nodesRef.current.add({
            id: node.point.id,
            label: node.label.indexOf(":") === -1 && node.label !== "root" ? node.label : "",
        });
    }
}
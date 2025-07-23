import VisTree from "../../VisTree/VisTree";
import styles from "./OSD.common.module.css";
import React, {RefObject, useContext, useEffect} from "react";
import {CanvasProps} from "./OSDCanvases";
import {assertExists} from "../../utils/util";
import {OSDContext} from "./OSD";
import {DataSet} from "vis-data";
import {Edge, Node} from "vis-network";
import {HSTTree, MarkedPoint} from "./algorithm/types";


export default function Tree(
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

function convertTreeToVis(tree: HSTTree, nodesRef: RefObject<DataSet<Node>>, edgesRef: RefObject<DataSet<Edge>>): void {
    const getNodeNumberByPos = (pos: MarkedPoint) => {
        return tree.nodes.findIndex((p) => p.point.id === pos.id);
    };
    nodesRef.current.clear();
    edgesRef.current.clear();
    for (const edge of tree.edges) {
        if (!nodesRef.current.get(getNodeNumberByPos(edge.from))) {
            const label = tree.nodes[getNodeNumberByPos(edge.from)].label.indexOf(":") === -1 ? tree.nodes[getNodeNumberByPos(edge.from)].label : "";
            nodesRef.current.add({id: getNodeNumberByPos(edge.from), label});
        }
        if (!nodesRef.current.get(getNodeNumberByPos(edge.to))) {
            const label = tree.nodes[getNodeNumberByPos(edge.to)].label.indexOf(":") === -1 ? tree.nodes[getNodeNumberByPos(edge.to)].label : "";
            nodesRef.current.add({id: getNodeNumberByPos(edge.to), label});
        }
        edgesRef.current.add({
            from: getNodeNumberByPos(edge.from),
            to: getNodeNumberByPos(edge.to),
            length: edge.length,
            label: edge.weight?.toString(),
        });
    }
}

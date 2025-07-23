import styles from "./Tree.module.css";
import {assertExists} from "../../utils/util";
import VisTree, {addEdge} from "../../VisTree/VisTree";
import React, {useRef} from "react";
import {DataSet} from "vis-data";
import {Edge, Node} from "vis-network";

type TreeProps = {
    setTitle: (title: string) => void;
};

export default function Tree({setTitle}: TreeProps) {
    const nodesRef = useRef(new DataSet<Node>([
        { id: 1, label: "1" },
        { id: 2, label: "2" },
        { id: 3, label: "3" },
        { id: 4, label: "4" },
    ]));

    const edgesRef = useRef(new DataSet<Edge>([
        { from: 1, to: 2, label: "5" },
        { from: 2, to: 3, label: "5" },
        { from: 1, to: 4, label: "5" },
    ]));

    const options = {
        nodes: {
            shape: "circle",
            size: 20,
            color: "#68788c",
        },
        edges: {
            color: "#68788c",
            font: { align: "top" },
        },
        physics: { enabled: true },
    };

    const newEdges = {
        from: useRef<HTMLInputElement>(null),
        to: useRef<HTMLInputElement>(null),
        label: useRef<HTMLInputElement>(null),
    };

    setTitle("Tree");

    return (
        <>
            <div className={styles.main}>
                <div className={styles.controlBar}>
                    <input type={"number"} placeholder={"from"} ref={newEdges.from}/>
                    <input type={"number"} placeholder={"to"} ref={newEdges.to}/>
                    <input type={"text"} placeholder={"label"} ref={newEdges.label}/>
                    <button onClick={() => {
                        addEdge(
                            edgesRef.current,
                            nodesRef.current,
                            Number(assertExists(newEdges.from.current).value),
                            Number(assertExists(newEdges.to.current).value),
                            assertExists(newEdges.label.current?.value),
                        )
                    }}>Add Edge
                    </button>
                    <button onClick={() => {
                        nodesRef.current.clear();
                        edgesRef.current.clear();
                    }}>
                        Clear
                    </button>
                </div>
                <VisTree
                    nodes={nodesRef.current}
                    edges={edgesRef.current}
                    options={options}
                    style={{
                        height: "700px",
                    }}
                />
            </div>
        </>
    );
}
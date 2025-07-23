import React, {useEffect, useRef} from "react";
import { Network, Node, Edge } from "vis-network";
import {DataSet} from "vis-data";

type Props = {
    nodes: DataSet<Node>;
    edges: DataSet<Edge>;
    options?: object;
    style?: React.CSSProperties;
    className?: string;
    defaultScale?: number;
};

const defaultOptions = {
    nodes: {
        widthConstraint: 30,
        heightConstraint: 30,
        font: {
            size: 20,
            face: 'Comfortaa',
        }
    },
    edges: {
        width: 5,
        font: {
            size: 45,
            face: 'Comfortaa',
        }
    },
    layout: {
        hierarchical: {
            enabled: true,
            direction: 'UD',
            sortMethod: 'directed',
            nodeSpacing: 100,
            treeSpacing: 100,
            levelSeparation: 500,
            shakeTowards: 'roots',
            blockShifting: false,
            edgeMinimization: false,
            parentCentralization: false,
        }
    },
};

const VisTree: React.FC<Props> = ({ nodes, edges, options, style, className, defaultScale }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const networkRef = useRef<Network | null>(null);
    useEffect(() => {
        if (containerRef.current && !networkRef.current) {
            networkRef.current = new Network(containerRef.current, { nodes, edges },  {...defaultOptions, ...options});
        }
        networkRef.current?.moveTo({
            scale: defaultScale,
            animation: false,
        })
    }, []);
    return <div ref={containerRef} style={style} className={className} />;
};

const addNode = (nodes: DataSet<Node>, id: number) => {
    nodes.add({ id, label: `${id}` });
};

const addEdge = (edges: DataSet<Edge>, nodes: DataSet<Node>, from: number, to: number, label: string) => {
    if (!nodes.get(from)) {
        addNode(nodes, from);
    }
    if (!nodes.get(to)) {
        addNode(nodes, to);
    }
    edges.get().forEach((edge) => {
        if (edge.from === from && edge.to === to) {
            edges.remove(edge);
        }
    });
    edges.add({ from, to, label });
};

export default VisTree;
export { addNode, addEdge };
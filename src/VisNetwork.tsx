import React, { useEffect, useRef } from "react";
import { Network, Node, Edge } from "vis-network";
import {DataSet} from "vis-data";

type Props = {
    nodes: DataSet<Node>;
    edges: DataSet<Edge>;
    options?: object;
    style?: React.CSSProperties;
};

export const VisNetwork: React.FC<Props> = ({ nodes, edges, options, style }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const networkRef = useRef<Network | null>(null);

    useEffect(() => {
        if (containerRef.current && !networkRef.current) {
            networkRef.current = new Network(containerRef.current, { nodes, edges }, options);
        }
    }, []);

    return <div ref={containerRef} style={style} />;
};

import React, { useEffect, useRef } from 'react';
import { Network } from 'vis-network/standalone/esm/vis-network';
import {DataSet} from "vis-network";

const VisNetwork = ({ nodesData, edgesData }) => {
    const containerRef = useRef(null);
    const networkRef = useRef(null);

    useEffect(() => {
        const nodes = new DataSet(nodesData);
        const edges = new DataSet(edgesData);

        const data = {
            nodes: nodes,
            edges: edges
        };

        const options = {
            nodes: {
                shape: 'dot',
                size: 16
            },
            physics: {
                enabled: true
            },
            interaction: {
                hover: true
            }
        };

        if (containerRef.current) {
            networkRef.current = new Network(containerRef.current, data, options);
        }

        return () => {
            if (networkRef.current) {
                networkRef.current.destroy();
            }
        };
    }, [nodesData, edgesData]);

    return <div ref={containerRef} style={{ height: '500px', border: '1px solid lightgray' }} />;
};

export default VisNetwork;

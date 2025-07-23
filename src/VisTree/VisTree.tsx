import React, { useEffect, useRef } from 'react';
import { DataSet } from 'vis-data';
import { Network, Node, Edge, Options } from 'vis-network';

export interface VisTreeProps {
    nodes: Node[];
    edges: Edge[];
    options?: Options;
    size?: {
        width: number;
        height: number;
    };
}

const VisTree: React.FC<VisTreeProps> = ({ nodes, edges, options, size }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const networkRef = useRef<Network | null>(null);

    useEffect(() => {
        if (containerRef.current) {
            const data = {
                nodes: new DataSet<Node>(nodes),
                edges: new DataSet<Edge>(edges),
            };

            const defaultOptions: Options = {
                layout: {
                    hierarchical: {
                        enabled: true,
                        direction: 'UD', // UD = top-down (или 'LR' для слева направо)
                        sortMethod: 'directed',
                        nodeSpacing: 100,
                        treeSpacing: 200,
                        levelSeparation: 150,
                    },
                },
                physics: {
                    enabled: false,
                },
                nodes: {
                    shape: 'box',
                },
                ...options,
            };

            networkRef.current = new Network(containerRef.current, data, defaultOptions);
        }

        return () => {
            networkRef.current?.destroy();
        };
    }, [nodes, edges, options]);

    return (
        <div
            ref={containerRef}
            style={{ width: (size?.width ?? 800) + 'px', height: (size?.height ?? 600) + 'px', border: '1px solid #ccc', background: '#282c34' }}
        />
    );
};

export default VisTree;

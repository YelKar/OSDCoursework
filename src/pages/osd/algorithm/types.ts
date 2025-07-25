export type Pos = {
    x: number;
    y: number;
}

export type Point = Pos & {
    expression?: Expression;
};

export type MarkedPoint = Point & {
    id: number | string | "root";
    state: "saturation" | "serviced";
}

export type Cluster = {
    center: MarkedPoint;
    radius: number;
    points: MarkedPoint[];
    children: Cluster[];
}

export type MetricInfo = {
    diameter: number;
    maxClusterRadius: number;
}

export type HSTEdge = {
    from: MarkedPoint;
    to: MarkedPoint;
    length: number;
    value?: number;
    state: "saturation" | "servicing";
};

export type Expression = {
    function: (x: number) => number;
    expression: string;
    lastX?: number;
}

export type HSTNode = {
    point: MarkedPoint;
    label: string;
};

export type HSTTree = {
    edges: HSTEdge[];
    nodes: HSTNode[];
    clusters: Cluster[];
    metricInfo: MetricInfo;
};

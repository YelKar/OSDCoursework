export type Pos = {
    x: number;
    y: number;
}

export type Point = Pos & {
    expression?: Expression;
};

export type MarkedPoint = Point & {
    id: number | string | "root";
}

export function PointsFromString(s: string): Point[] {
    return s.trim().split(/\s+/).map(pair => {
        const [xStr, yStr] = pair.split(',');
        return { x: Number(xStr), y: Number(yStr) };
    });
}

export function PointsToString(points: Point[]): string {
    return points.map(p => `${p.x},${p.y}`).join(' ');
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
};

export type Expression = {
    function: (x: number) => number;
    expression: string;
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

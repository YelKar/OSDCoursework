import {Cluster, HSTEdge, HSTNode, HSTTree, MarkedPoint, Point} from "./types";
import {assertExists, getCSSVariable} from "../../../utils/util";


function normNumber(val: number | null | undefined, alt: number) {
    return Number.isFinite(val) ? (val ?? alt) : alt;
}
export type Options = {
    isLazy?: boolean;
    betaCoefficient?: number;
}

export function DrawClusters(clusters: Cluster[], context: CanvasRenderingContext2D, scale: number) {
    for (const cluster of clusters) {
        drawCluster({
            x: cluster.center.x,
            y: cluster.center.y
        }, cluster.radius, context, scale);
        DrawClusters(cluster.children, context, scale);
    }
}

function drawCluster(point: Point, radius: number, context: CanvasRenderingContext2D, scale: number): void {
    context.beginPath();
    context.arc(point.x * scale, point.y * scale, radius * scale, 0, 2 * Math.PI);
    context.closePath();
    context.strokeStyle = getCSSVariable("--accent-color");
    context.stroke();
}

export default function MetricApproximation(points: MarkedPoint[], options: Options): HSTTree {
    const metricDiameter = getMetricDiameter(points);
    const betaCoefficient = normNumber(options.betaCoefficient, 1);

    const delta = normNumber(Math.ceil(Math.log2(metricDiameter)), 1);
    const maxClusterRadius = 2 ** (delta - 1) * betaCoefficient;
    if (delta < 1) {
        return {edges: [], nodes: [], clusters: [], metricInfo: {diameter: normNumber(metricDiameter, 0), maxClusterRadius: 0}};
    }
    const clusters = approximate(points, maxClusterRadius, options);
    const {edges, nodes} = clustersToTree([{
        center: {
            x: 0,
            y: 0,
            id: "root",
        },
        radius: metricDiameter,
        points: points,
        children: clusters,
    }]);
    return {edges, nodes, clusters, metricInfo: {diameter: normNumber(metricDiameter, 0), maxClusterRadius: maxClusterRadius}};
}

function getMetricDiameter(points: Point[]): number {
    return Math.max(
        ...points
            .map(
                (p, i) => Math.max(
                    ...points.slice(i + 1).map(q => distance(p, q))
                )
            )
    );
}

function createNodeId(cluster: Cluster): string {
    return cluster.children.length > 0 && cluster.center.id !== "root" ? cluster.radius + ":" + cluster.points.map(p => p.id).toString() : cluster.center.id.toString();
}

function clustersToTree(clusters: Cluster[]): Pick<HSTTree, "edges" | "nodes"> {
    const nodes: HSTNode[] = [];
    const edges: HSTEdge[] = [];

    for (const cluster of clusters) {
        const clusterId = createNodeId(cluster);
        nodes.push({
            point: {
                ...cluster.center,
                id: clusterId,
            },
            label: clusterId
        });
        for (const child of cluster.children) {
            const childId = createNodeId(child);
            edges.push({
                from: {
                    ...cluster.center,
                    id: clusterId,
                },
                to: {
                    ...child.center,
                    id: childId,
                },
                length: child.radius,
            });
        }
        const {edges: childEdges, nodes: childNodes} = clustersToTree(cluster.children);
        edges.push(...childEdges);
        nodes.push(...childNodes);
    }

    return {edges, nodes}
}

function approximate(points: MarkedPoint[], radius: number, options: Options): Cluster[] {
    const isLazy = options.isLazy ?? false;

    if (radius <= 1 || (points.length === 1 && isLazy)) {
        return points.map(point => ({
            center: point,
            radius: radius,
            points: [point],
            children: []
        }));
    }
    const clusters: Cluster[] = [];
    for (const point of points) {
        if (!clusters.some(cluster => distance(cluster.center, point) < radius)) {
            clusters.push({
                center: point,
                radius,
                points: [point],
                children: [],
            });
        } else {
            assertExists(clusters.find(cluster => distance(cluster.center, point) < radius)).points.push(point);
        }
    }
    for (const cluster of clusters) {
        if ((cluster.points.length > 1 && isLazy) || !isLazy) {
            cluster.children = approximate(cluster.points, radius / 2, options);
        }
    }
    return clusters;
}

function distance(p1: Point, p2: Point): number {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}
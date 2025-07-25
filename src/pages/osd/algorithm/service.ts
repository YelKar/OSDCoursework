import {HSTEdge, HSTNode, HSTTree, MarkedPoint} from "./types";
import Saturate, {IsSaturatedEdge} from "./saturation";
import {assertExists} from "../../../utils/util";


export type ServicingPath = {
    edges: Set<HSTEdge>,
    newServerPoint: MarkedPoint
};

export default function Service(serverMovement: MarkedPoint[], points: MarkedPoint[], tree: Pick<HSTTree, "nodes" | "edges">): ServicingPath | undefined {
    const server = serverMovement[serverMovement.length - 1];
    const [saturatedPath, majorEdge] = CheckSaturation(server, points, tree.edges);
    if (saturatedPath.length === 0 || majorEdge === null) {
        return;
    }
    const edgesToService: HSTEdge[] = [];
    const relevantTree = GetRelevantSubtree(majorEdge, tree);
    console.log("RelevantTree:", relevantTree);
    const criticalTree = GetCriticalSubtree(majorEdge, relevantTree);
    console.log("CriticalTree:", criticalTree);
    edgesToService.push(...criticalTree);
    const {edges: keyEdges} = GetKeyEdges(majorEdge, criticalTree);
    console.log("KeyEdges:", keyEdges);
    for (const keyEdge of keyEdges) {
        edgesToService.push(keyEdge, ...TimeForwarding(majorEdge, tree));
    }
    for (const edge of edgesToService) {
        edge.state = "servicing";
    }
    return {
        edges: new Set(edgesToService),
        newServerPoint: keyEdges[keyEdges.length - 1].to,
    };;
}

export function TimeForwarding(keyEdge: HSTEdge, tree: Pick<HSTTree, "edges" | "nodes">) {
    const keySubtree = GetRelevantSubtree(keyEdge, tree);
    while (keySubtree.some(e => !IsSaturatedEdge(e))) {
        if (IsOversaturated(keyEdge, keySubtree)) {
            const gSet = GetGSet(keyEdge, keySubtree);
            while (EdgesSum(gSet) > 1.5 * keyEdge.length) {
                gSet.pop();
            }
            const hSet = GetHSet(keyEdge, gSet);
            for (const hSetEdge of hSet) {
                hSet.push(...TimeForwarding(hSetEdge, tree));
            }
            return hSet;
        }
        Saturate({
            edges: keySubtree,
            nodes: tree.nodes.filter(node => keySubtree.some(edge => edge.from.id === node.point.id || edge.to.id === node.point.id))
        }, 100);
    }
    return [];
}

export function GetGSet(edge: HSTEdge, subtree: HSTEdge[]) {
    const result = [];
    const leafEdges = subtree.filter(e => !subtree.some(child => child.from.id === e.to.id));
    for (const leafEdge of leafEdges) {
        const path = GetPathBetweenPoints(edge.to, leafEdge.to, subtree);
        if (path.length === 0) {
            throw new Error("GSet");
        }
        for (const pathEdge of path) {
            if (!IsOversaturated(pathEdge, subtree)) {
                if (result.findIndex(e => pathEdge.from.id === e.from.id && pathEdge.to.id === e.to.id) !== -1) {
                    result.push(pathEdge);
                }
                break;
            }
        }
    }
    return result;
}

export function GetHSet(edge: HSTEdge, gSet: HSTEdge[]) {
    const result = [];
    let sum = 0;
    for (const gSetEdge of gSet) {
        sum += gSetEdge.length;
        result.push(gSetEdge);
        if (sum >= edge.length) {
            return result;
        }
    }
    return result;
}

export function CheckSaturation(server: MarkedPoint, points: MarkedPoint[], edges: HSTEdge[]): [HSTEdge[], HSTEdge|null] {
    for (const point of points) {
        const majorEdge = GetMajorEdge(server, point, edges);
        if (majorEdge && IsSaturatedEdge(majorEdge)) {
            return [GetPathBetweenPoints(server, point, edges), majorEdge];
        }
    }
    return [[], null];
}

export function IsOversaturated(edge: HSTEdge, tree: HSTEdge[]) {
    let weight = 0;
    const subtree = GetCriticalSubtree(edge, GetRelevantSubtree(edge, {edges: tree}));
    for (const childEdge of subtree) {
        if (IsSaturatedEdge(childEdge) && !(childEdge.from.id === edge.from.id && childEdge.to.id === edge.to.id)) {
            weight += childEdge.value ?? 0;
        }
    }
    return weight >= edge.length;
}

export function GetRelevantSubtree(majorEdge: HSTEdge, tree: Pick<HSTTree, "edges">): HSTEdge[] {
    const relevantEdges = [majorEdge];
    for (const child of tree.edges.filter(e => e.from.id === majorEdge.to.id)) {
        relevantEdges.push(...GetRelevantSubtree(child, tree));
    }
    return relevantEdges;
}

export function GetCriticalSubtree(majorEdge: HSTEdge, relevantSubtree: HSTEdge[]) {
    const criticalEdges = [majorEdge];
    for (const edge of relevantSubtree.filter(e => e.from.id === majorEdge.to.id)) {
        if (IsSaturatedEdge(edge)) {
            criticalEdges.push(...GetCriticalSubtree(edge, relevantSubtree));
        }
    }
    return criticalEdges;
}

export function GetKeyEdges(majorEdge: HSTEdge, criticalSubtree: HSTEdge[]): {weight: number, edges: HSTEdge[]} {
    const edges= [];
    let weight = 0;
    for (const child of criticalSubtree.filter(e => e.from.id === majorEdge.to.id)) {
        const {weight: childWeight, edges: childEdges} = GetKeyEdges(child, criticalSubtree);
        weight += childWeight;
        edges.push(...childEdges);
    }

    if (majorEdge.length >= weight) {
        return {
            weight: majorEdge.length,
            edges: [majorEdge],
        };
    }
    return {
        weight,
        edges,
    };
}

export function GetPathBetweenPoints(point1: MarkedPoint, point2: MarkedPoint, edges: HSTEdge[]) {
    let pathFrom2ToRoot = [];
    let currentPoint = point2;
    while (currentPoint.id !== "root") {
        const edge = edges.find(e => e.to.id.toString() === currentPoint.id.toString());
        if (!edge) {
            return [];
        }
        pathFrom2ToRoot.push(edge);
        currentPoint = edge.from;
        if (currentPoint.id === point1.id) {
            return pathFrom2ToRoot.reverse();
        }
    }
    let pathFrom1ToRoot = [];
    let current = point1;
    while (current.id !== "root") {
        const edge = edges.find(e => e.to.id === current.id);
        if (!edge) {
            return [];
        }
        pathFrom1ToRoot.push(edge);
        current = edge.from;
        if (current.id === point2.id) {
            return pathFrom1ToRoot.reverse();
        }
        const possibleEdge = pathFrom2ToRoot.find(e => e.from.id === current.id);
        if (possibleEdge) {
            return pathFrom2ToRoot.slice(0, pathFrom2ToRoot.indexOf(possibleEdge) + 1).concat(pathFrom1ToRoot.reverse());
        }
    }
    return [];
}

export function GetMajorEdge(server: MarkedPoint, point: MarkedPoint, edges: HSTEdge[]): HSTEdge | undefined {
    const path = GetPathBetweenPoints(server, point, edges);
    if (path.length > 0) {
        return path.reduce((acc, cur) => acc.length >= cur.length ? acc : cur, path[0]);
    }
}

export function EdgesSum(edges: HSTEdge[]) {
    let result = 0;
    for (const edge of edges) {
        result += edge.value ?? 0;
    }
    return result;
}

export function ServiceEdges(serverMovement: MarkedPoint[], {edges, newServerPoint}: ServicingPath, nodes: HSTNode[], points: MarkedPoint[], singleServicing: boolean = false) {
    edges.forEach(edge => {
        delete edge.value;
        edge.state = "saturation";
        if (edge.to.expression) {
            edge.to.expression.lastX = 0;
            serverMovement.push(edge.to);
        }
        if (singleServicing) {
            const point = points.find(p => edge.to.id == p.id);
            if (point) {
                point.state = "serviced";
            }
            const node = nodes.find(n => edge.to.id == n.point.id);
            if (node) {
                node.point.state = "serviced";
            }
        }
    });
    console.log("newServerPoint:", newServerPoint);
    serverMovement.push(newServerPoint);
}

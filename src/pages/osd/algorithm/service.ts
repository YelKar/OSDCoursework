import {HSTEdge, HSTTree, MarkedPoint} from "./types";
import {IsSaturatedEdge} from "./saturation";
import {assertExists} from "../../../utils/util";

export default function Service(server: MarkedPoint, points: MarkedPoint[], tree: HSTTree) {
    const [saturatedPath, majorEdge] = CheckSaturation(server, points, tree.edges);
    if (saturatedPath.length === 0 || majorEdge === null) {
        return;
    }
    const relevantTree = GetRelevantSubtree(majorEdge, tree);
    console.log("RelevantTree:", relevantTree);
    const criticalTree = GetCriticalSubtree(majorEdge, relevantTree)
    console.log("CriticalTree:", criticalTree);
    const keyEdges = GetKeyEdges(majorEdge, criticalTree);
    console.log("KeyEdges:", keyEdges);
    
    return true;
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

export function GetRelevantSubtree(majorEdge: HSTEdge, tree: HSTTree): HSTEdge[] {
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
        return path.reduce((acc, cur) => acc.length > cur.length ? acc : cur, path[0]);
    }
}
import {HSTEdge, MarkedPoint} from "./types";

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
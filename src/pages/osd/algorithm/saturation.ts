import {HSTEdge, HSTTree} from "./types";

type DeltaTime = {
    start: number;
    end: number;
}

export default function Saturate(tree: HSTTree, deltaTime: DeltaTime, defaultFunction: (x: number) => number = (x => x)) {
    if (tree.nodes.length < 2) {
        return;
    }
    const leafNodes = tree.nodes.filter(node => node.point.id.toString().indexOf(":") === -1 && node.point.id.toString() !== "root");
    for (const node of leafNodes) {
        const firstEdge = tree.edges.find(edge => edge.to.id === node.point.id);
        if (!firstEdge) {
            throw new Error(`Node ${node.point.id} has no edges`);
        }
        const nodeFunction = node.point.expression?.function ?? defaultFunction;
        SaturateEdge(firstEdge, tree.edges,  nodeFunction(deltaTime.end / 1000) - nodeFunction(deltaTime.start / 1000));
    }
}
function SaturateEdge(edge: HSTEdge, edges: HSTEdge[], delta: number) {
    if (IsSaturatedEdge(edge)) {
        const parentEdge = edges.find(e => e.to.id === edge.from.id);
        if (parentEdge) {
            SaturateEdge(parentEdge, edges, delta);
        }
        return;
    }
    const leftUntilSaturation = edge.length - (edge.value ?? 0);
    edge.value = (edge.value ?? 0) + Math.min(leftUntilSaturation, delta);
    if (delta > leftUntilSaturation) {
        SaturateEdge(edge, edges, delta - leftUntilSaturation);
    }
}

export function IsSaturatedEdge(edge: HSTEdge) {
    return (edge?.value ?? 0) >= edge.length;
}

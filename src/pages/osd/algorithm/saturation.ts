import {HSTEdge, HSTTree} from "./types";

export default function Saturate(tree: Pick<HSTTree, "edges" | "nodes">, deltaTime: number, defaultFunction: (x: number) => number = (x => x)) {
    if (tree.nodes.length < 2) {
        return;
    }
    deltaTime /= 1000;
    const leafNodes = tree.nodes.filter(node => node.point.id.toString().indexOf(":") === -1 && node.point.id.toString() !== "root" && node.point.state !== "serviced");
    for (const node of leafNodes) {
        const firstEdge = tree.edges.find(edge => edge.to.id === node.point.id);
        if (!firstEdge) {
            throw new Error(`Node ${node.point.id} has no edges`);
        }
        if (!node.point.expression) {
            node.point.expression = {
                function: defaultFunction,
                expression: `x`,
                lastX: 0,
            };
        }
        if (!node.point.expression.lastX) {
            node.point.expression.lastX = 0;
        }
        const nodeFunction = node.point.expression?.function ?? defaultFunction;
        SaturateEdge(firstEdge, tree.edges,  nodeFunction(deltaTime + node.point.expression.lastX) - nodeFunction(node.point.expression.lastX));
        node.point.expression.lastX += deltaTime;
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

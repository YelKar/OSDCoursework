import styles from "./OSD.common.module.css";
import React, {useContext, useEffect} from "react";
import {assertExists, getCSSVariable} from "../../utils/util";
import {addPoint, CanvasProps} from "./OSDCanvases";
import {HSTEdge, MarkedPoint, Point} from "./algorithm/types";
import MetricApproximation, {DrawClusters, Options as ApproximationOptions} from "./algorithm/approximation";
import {OSDContext} from "./OSD";

const axisPadding = 5;
const pointRadius = 5;
const tickSize = 10;
const tickMarkLength = 10;
const scaleChangeCoef = 1000;

type OSDMetricSpaceProps = CanvasProps & {
    approximationOptions?: ApproximationOptions;
};

export default function OSDMetricSpace(
    {
        approximationOptions,
        ...style
    }: OSDMetricSpaceProps
) {
    const {
        treeRef: [,tree,setTree],
        pointsRef: pointsWatchedRef,
        lastPointId: [lastPointId,setLastPointId],
        serverMovement: [,serverMovement,]
    } = assertExists(useContext(OSDContext));
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [mousePosition, setMousePosition] = React.useState<Point>({x: 0, y: 0});
    const [pointsRef, points] = pointsWatchedRef;

    const [scale, setScale] = React.useState(10);

    useEffect(() => {
        const newTree = MetricApproximation(points, approximationOptions ?? {});
        for (let i = 0; i < newTree.nodes.length; i++) {
            const oldNode = tree.nodes.find((n) => n.point.id === newTree.nodes[i].point.id);
            if (oldNode) {
                newTree.nodes[i] = {
                    ...oldNode,
                    ...newTree.nodes[i],
                };
            }
        }
        for (let i = 0; i < newTree.edges.length; i++) {
            const oldEdge = tree.edges.find((e) => e.from.id === newTree.edges[i].from.id && e.to.id === newTree.edges[i].to.id);
            if (oldEdge) {
                newTree.edges[i] = {
                    ...oldEdge,
                    ...newTree.edges[i],
                };
            }
        }
        setTree(newTree);
    }, [points, approximationOptions]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = style.size.width;
        canvas.height = style.size.height;
        const context = canvas.getContext("2d");
        if (!context) return;
        context.clearRect(0, 0, canvas.width, canvas.height);
        drawServerMovement(serverMovement, scale, context);
        pointsRef.current.forEach((point) => {
            context.fillStyle = getCSSVariable("--text-color");
            context.beginPath();
            context.arc(point.x * scale, point.y * scale, pointRadius, 0, 2 * Math.PI);
            context.fill();
            context.fillStyle = getCSSVariable("--secondary-color");
            context.font = "20px Comfortaa";
            context.fillText(`${point.id}`, point.x * scale, point.y * scale + 25);
        });

        const serverPosition = serverMovement[serverMovement.length - 1];
        context.fillStyle = getCSSVariable("--server-color");
        context.beginPath();
        context.arc(serverPosition.x * scale, serverPosition.y * scale, pointRadius, 0, 2 * Math.PI);
        context.fill();
        context.fillStyle = getCSSVariable("--secondary-color");
        context.font = "20px Comfortaa";

        drawAxis(context, style.size, scale);
        drawMousePosition(context, mousePosition, scale);
        DrawClusters(tree.clusters, context, scale);
    }, [style.size.width, style.size.height, mousePosition, points.length, tree, scale]);

    return (
        <div>
            <canvas
                ref={canvasRef}
                onClick={(e) => {
                    const newPoint: MarkedPoint = {
                        x: Math.round(e.nativeEvent.offsetX / scale),
                        y: Math.round(e.nativeEvent.offsetY / scale),
                        id: lastPointId + 1,
                        expression: {
                            function: x => x,
                            expression: "x",
                        },
                        state: "saturation",
                    };
                    addPoint(pointsWatchedRef, newPoint);
                    setLastPointId(lastPointId + 1);
                }}
                className={styles.canvas}
                style={{
                    top: style.pos.y + "px",
                    left: style.pos.x + "px",
                    cursor: "none",
                }}
                onMouseMove={(e) => {
                    setMousePosition({x: e.nativeEvent.offsetX / scale, y: e.nativeEvent.offsetY / scale});
                }}
                onMouseLeave={() => {
                    setMousePosition({x: 0, y: 0});
                }}
                onWheel={(e) => {
                    const newScale = scale - e.deltaY / scaleChangeCoef * scale;
                    if (newScale > 0.5)
                        setScale(newScale);
                    else
                        setScale(0.5);
                    setMousePosition({x: e.nativeEvent.offsetX / scale, y: e.nativeEvent.offsetY / scale});
                }}
            ></canvas>
        </div>
    );
}

function drawAxis(context: CanvasRenderingContext2D, size: { width: number; height: number }, scale: number) {
    context.strokeStyle = getCSSVariable("--secondary-color");
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(axisPadding, axisPadding);
    context.lineTo(size.width - axisPadding, axisPadding);

    for (let x = axisPadding + tickSize * scale; x < size.width - axisPadding; x += tickSize * scale) {
        context.moveTo(x, axisPadding);
        context.lineTo(x, tickMarkLength * Math.log(scale) / 5 + 5 + axisPadding);
    }

    context.moveTo(axisPadding, axisPadding);
    context.lineTo(axisPadding, size.height - axisPadding);

    for (let y = axisPadding + tickSize * scale; y < size.height - axisPadding; y += tickSize * scale) {
        context.moveTo(axisPadding, y);
        context.lineTo(tickMarkLength * Math.log(scale) / 5 + 5 + axisPadding, y);
    }

    context.closePath();
    context.stroke();
}

function drawMousePosition(context: CanvasRenderingContext2D, pos: Point, scale: number) {
    if (pos.x === 0 && pos.y === 0) return;
    context.fillStyle = getCSSVariable("--secondary-color");
    context.font = "20px Comfortaa";
    context.fillText(`(${pos.x}; ${pos.y})`, pos.x * scale, pos.y * scale + 25);
    context.beginPath();
    context.arc(pos.x * scale, pos.y * scale, pointRadius, 0, 2 * Math.PI);
    context.fill();
}

function drawServerMovement(serverMovement: MarkedPoint[], scale: number, context: CanvasRenderingContext2D) {
    context.beginPath();
    context.moveTo(serverMovement[0].x * scale, serverMovement[0].y * scale);
    for (const pos of serverMovement.slice(1)) {
        context.lineTo(pos.x * scale, pos.y * scale);
    }
    context.strokeStyle = "#f806";
    context.lineWidth = 2;
    context.stroke();
    context.closePath();
}
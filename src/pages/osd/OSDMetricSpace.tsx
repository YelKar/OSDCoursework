import styles from "../OSD.common.module.css";
import React, {useContext, useEffect} from "react";
import {assertExists, getCSSVariable} from "../../../utils/util";
import {addPoint, CanvasProps} from "../OSDCanvases";
import {Point} from "../algorithm/types";
import MetricApproximation, {DrawClusters, Options as ApproximationOptions} from "../algorithm/approximation";
import {OSDContext} from "../OSD";

const axisPadding = 5;
const pointRadius = 5;
const tickSize = 100;
const tickMarkLength = 10;
const scale = 10;

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
    } = assertExists(useContext(OSDContext));
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [mousePosition, setMousePosition] = React.useState<Point>({x: 0, y: 0});
    const [pointsRef, points] = pointsWatchedRef;
    useEffect(() => {
        setTree(MetricApproximation(points, approximationOptions ?? {}));
    }, [points, approximationOptions]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        canvas.width = style.size.width;
        canvas.height = style.size.height;
        const context = canvas.getContext("2d");
        if (!context) return;
        context.clearRect(0, 0, canvas.width, canvas.height);
        pointsRef.current.forEach((point, i) => {
            context.fillStyle = getCSSVariable("--text-color");
            context.beginPath();
            context.arc(point.x * scale, point.y * scale, pointRadius, 0, 2 * Math.PI);
            context.fill();
            context.fillStyle = getCSSVariable("--secondary-color");
            context.font = "20px Comfortaa";
            context.fillText(`${i}`, point.x * scale, point.y * scale + 25);
        });

        drawAxis(context, style.size);
        drawMousePosition(context, mousePosition);
        DrawClusters(tree.clusters, context, scale);
    }, [style.size.width, style.size.height, mousePosition, points.length, tree]);

    return (
        <div>
            <canvas
                ref={canvasRef}
                onClick={(e) => {
                    addPoint(pointsWatchedRef, {x: Math.round(e.nativeEvent.offsetX / scale), y: Math.round(e.nativeEvent.offsetY / scale)});
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
            ></canvas>
        </div>
    );
}

function drawAxis(context: CanvasRenderingContext2D, size: { width: number; height: number }) {
    context.strokeStyle = getCSSVariable("--secondary-color");
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(axisPadding, axisPadding);
    context.lineTo(size.width - axisPadding, axisPadding);

    for (let x = axisPadding + tickSize; x < size.width - axisPadding; x += tickSize) {
        context.moveTo(x, axisPadding);
        context.lineTo(x, tickMarkLength + axisPadding);
    }

    context.moveTo(axisPadding, axisPadding);
    context.lineTo(axisPadding, size.height - axisPadding);

    for (let y = axisPadding + tickSize; y < size.height - axisPadding; y += tickSize) {
        context.moveTo(axisPadding, y);
        context.lineTo(tickMarkLength + axisPadding, y);
    }

    context.closePath();
    context.stroke();
}

function drawMousePosition(context: CanvasRenderingContext2D, pos: Point) {
    if (pos.x === 0 && pos.y === 0) return;
    context.fillStyle = getCSSVariable("--secondary-color");
    context.font = "20px Comfortaa";
    context.fillText(`(${pos.x}; ${pos.y})`, pos.x * scale, pos.y * scale + 25);
    context.beginPath();
    context.arc(pos.x * scale, pos.y * scale, pointRadius, 0, 2 * Math.PI);
    context.fill();
}
import {Page} from "../../../types";
import React, {useEffect, useState} from "react";
import {DataSet} from "vis-data";
import {Edge, Node} from "vis-network";
import styles from "../OSD.common.module.css";
import Tree from "../Tree";
import ApproximationMetricSpace from "./ApproximationMetricSpace";
import {getCSSVariable} from "../../../utils/util";
import "./Approximation.css"
import {Point, PointsFromString, PointsToString} from "../algorithm/types";
import useWatchedRef, {WatchedRef} from "../../../utils/useWatchRef";
import {Options as ApproximationOptions} from "../algorithm/approximation";
import ApproximationInfoBar from "./ApproximationInfoBar";

export const addPoint = ([,points, setPoints]: WatchedRef<Point[]>, point: Point) => {
    setPoints([...points, point]);
};

export type CanvasProps = {
    pos: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
};

export default function Approximation({setTitle}: Page) {
    const [approximationOptions, setApproximationOptions] = useState<ApproximationOptions>({});

    const refs = {
        nodesRef: useWatchedRef(new DataSet<Node>()),
        edgesRef: useWatchedRef(new DataSet<Edge>()),
        pointsRef: useWatchedRef<Point[]>([]),
    }

    const [,points, setPoints] = refs.pointsRef;

    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [windowHeight, setWindowHeight] = useState(window.innerHeight);
    const handleResize = () => {
        setWindowWidth(window.innerWidth);
        setWindowHeight(window.innerHeight);
    };

    useEffect(() => {
        setTitle("OSD — аппроксимация метрического пространства на HST-дереве");
        window.addEventListener('resize', handleResize);
        if (localStorage.getItem("Approximation.points") !== null && localStorage.getItem("Approximation.points")?.trim() !== "") {
            setPoints(PointsFromString(localStorage.getItem("Approximation.points") ?? ""));
        }
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        localStorage.setItem("Approximation.points", PointsToString(points))
    }, [points]);

    const leftBarWidth = 150;
    const headerHeight = Number(getCSSVariable("--header-height").replace("px", ""));
    const canvasMargin = Number(getCSSVariable("--canvas-margin").replace("px", ""));
    const canvasWidth = (windowWidth - leftBarWidth) / 2 - canvasMargin * 2;
    const canvasHeight = windowHeight - headerHeight - canvasMargin * 2;
    return (
        <div>
            <div className={styles.canvases}>
                <ApproximationInfoBar
                    pos={{
                        x: 0,
                        y: canvasMargin + headerHeight,
                    }}
                    size={{
                        width: leftBarWidth,
                        height: canvasHeight,
                    }}
                    setApproximationOptions={setApproximationOptions}
                />
                <ApproximationMetricSpace
                    pos={{
                        x: canvasMargin + leftBarWidth,
                        y: canvasMargin + headerHeight
                    }}
                    size={{
                        width: canvasWidth,
                        height: canvasHeight,
                    }}
                    approximationOptions={approximationOptions}
                />
                <Tree
                    pos={{
                        x: canvasMargin * 2 + canvasWidth + leftBarWidth,
                        y: canvasMargin + headerHeight
                    }}
                    size={{
                        width: canvasWidth,
                        height: canvasHeight,
                    }}
                />
            </div>
        </div>
    )
}
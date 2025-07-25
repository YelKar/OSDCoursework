import React, {useEffect, useState} from "react";
import {DataSet} from "vis-data";
import {Edge, Node} from "vis-network";
import styles from "./OSD.common.module.css";
import OSDTree from "./OSDTree";
import OSDMetricSpace from "./OSDMetricSpace";
import {getCSSVariable} from "../../utils/util";
import "./OSD.css"
import {MarkedPoint, Point} from "./algorithm/types";
import useWatchedRef, {WatchedRef} from "../../utils/useWatchRef";
import {Options as ApproximationOptions} from "./algorithm/approximation";
import OSDInfoBar from "./OSDInfoBar";

export const addPoint = ([,points, setPoints]: WatchedRef<MarkedPoint[]>, point: MarkedPoint) => {
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

export default function OSDCanvases() {
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
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const leftBarWidth = 250;
    const headerHeight = Number(getCSSVariable("--header-height").replace("px", ""));
    const canvasMargin = Number(getCSSVariable("--canvas-margin").replace("px", ""));
    const canvasWidth = (windowWidth - leftBarWidth) / 2 - canvasMargin * 2;
    const canvasHeight = (windowHeight - headerHeight) - canvasMargin * 2;
    const leftBarHeight = windowHeight - headerHeight - canvasMargin * 2;
    return (
        <div>
            <div className={styles.canvases}>
                <OSDMetricSpace
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
                <OSDTree
                    pos={{
                        x: canvasMargin * 2 + canvasWidth + leftBarWidth,
                        y: canvasMargin + headerHeight
                    }}
                    size={{
                        width: canvasWidth,
                        height: canvasHeight,
                    }}
                />
                <OSDInfoBar
                    pos={{
                        x: 0,
                        y: canvasMargin + headerHeight,
                    }}
                    size={{
                        width: leftBarWidth,
                        height: leftBarHeight,
                    }}
                    setApproximationOptions={setApproximationOptions}
                />
            </div>
        </div>
    )
}
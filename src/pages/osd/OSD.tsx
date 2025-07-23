import {Page} from "../../types";
import {createContext, Dispatch, SetStateAction, useEffect, useState} from "react";
import useWatchedRef, {WatchedRef} from "../../utils/useWatchRef";
import {HSTTree, MarkedPoint} from "./algorithm/types";
import OSDCanvases from "./OSDCanvases";


export const OSDContext = createContext<{
    treeRef: WatchedRef<HSTTree>;
    pointsRef: WatchedRef<MarkedPoint[]>;
    isRunning: [boolean, Dispatch<SetStateAction<boolean>>];
    startTime: [number, Dispatch<SetStateAction<number>>];
    lastPointId: [number, Dispatch<SetStateAction<number>>];
    serverMovement: WatchedRef<MarkedPoint[]>;
}|undefined>(undefined);

export default function OSD({setTitle}: Page) {
    const refs = {
        treeRef: useWatchedRef<HSTTree>({
            edges: [],
            nodes: [],
            clusters: [],
            metricInfo: {
                diameter: -1,
                maxClusterRadius: -1,
            },
        }),
        pointsRef: useWatchedRef<MarkedPoint[]>([]),
        isRunning: useState(false),
        startTime: useState(-1),
        lastPointId: useState(0),
        serverMovement: useWatchedRef<MarkedPoint[]>([{x: 0, y: 0, id: "root"}]),
    };
    useEffect(() => {
        setTitle("OSD — Online Service with Delay");
    }, []);

    return (
        <>
            <OSDContext.Provider value={refs}>
                <OSDCanvases/>
            </OSDContext.Provider>
        </>
    );
}
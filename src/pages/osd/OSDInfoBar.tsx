import {CanvasProps} from "./OSDCanvases";
import styles from "./OSD.common.module.css";
import {Options as ApproximationOptions} from "./algorithm/approximation";
import React, {Dispatch, SetStateAction, useContext, useEffect, useRef, useState} from "react";
import Checkbox from "../../utils/Checkbox";
import {assertExists, formatNumber, getCSSVariable} from "../../utils/util";
import {OSDContext} from "./OSD";
import Time, {TimeHandle} from "./Time";
import {PopupRef, StringInputPopup} from "../../utils/StringInputPopup";
import parseExpression from "./algorithm/expressionParsing";
import {HSTEdge, MarkedPoint} from "./algorithm/types";
import {WatchedRef} from "../../utils/useWatchRef";
import Saturate, {IsSaturatedEdge} from "./algorithm/saturation";
import Service, {GetMajorEdge, GetPathBetweenPoints, ServiceEdges, ServicingPath} from "./algorithm/service";

type OSDInfoBarProps = CanvasProps & {
    setApproximationOptions: Dispatch<SetStateAction<ApproximationOptions>>;
};


export default function OSDInfoBar({
    pos, size,
    setApproximationOptions,
}: OSDInfoBarProps) {
    const {
        pointsRef: pointsWatchedRef,
        treeRef: [treeRef,tree,setTree],
        isRunning: [isRunning, setIsRunning],
        startTime: [startTime, setStartTime],
        lastPointId:[,setLastPointId],
        serverMovement: [serverMovementRef,,setServerMovement],
    } = assertExists(useContext(OSDContext));
    const [pointsRef,,setPoints] = pointsWatchedRef;
    const {metricInfo} = tree;
    const [stopTime, setStopTime] = useState(-1);
    const lastSaturationTimeRef = useRef<number>(-1);
    const [edgesToService, setEdgesToService] = useState<ServicingPath | undefined>(undefined);
    const [singleServicing, setSingleServicing] = useState<boolean>(true);
    useEffect(() => {
        if (localStorage.getItem("approximation.betaCoefficient") !== null) {
            setApproximationOptions(opt => {
                opt.betaCoefficient = parseFloat(localStorage.getItem("approximation.betaCoefficient") ?? "1");
                return opt;
            });
        }
        if (localStorage.getItem("approximation.isLazy") !== null) {
            setApproximationOptions(opt => {
                opt.isLazy = localStorage.getItem("approximation.isLazy") === "true";
                return opt;
            });
        }
    }, []);
    useEffect(() => {
        const interval = setInterval(() => {
            if (isRunning) {
                const updatedTree = treeRef.current;
                Saturate(updatedTree, Date.now() - lastSaturationTimeRef.current);
                lastSaturationTimeRef.current = Date.now();
                setTree({...updatedTree});
                const servicingResult = Service(serverMovementRef.current, pointsRef.current, treeRef.current);
                if (servicingResult) {
                    stop();
                    setEdgesToService(servicingResult);
                };
            }
        }, 100);
        return () => {
            clearInterval(interval);
        }
    }, [isRunning]);

    const timeRef = React.useRef<TimeHandle>(null);
    const popupRef = React.useRef<PopupRef<number|string>>(null);

    const reset = () => {
        setStartTime(-1);
        setTree({...tree, edges: tree.edges.map(e => ({...e, value: 0}))});
        timeRef.current?.reset();
        treeRef.current.edges.forEach(e => {
            delete e.value;
        });
        treeRef.current.nodes.forEach(n => {
            if (n.point.expression) {
                n.point.expression.lastX = 0;
                n.point.state = "saturation";
            }
        });
        pointsRef.current.forEach(p => {
            p.state = "saturation";
        })
        setServerMovement([serverMovementRef.current[0]]);
    }

    const start = () => {
        setIsRunning(true);
        if (startTime === -1) {
            setStartTime(Date.now());
            lastSaturationTimeRef.current = Date.now();
        } else {
            setStartTime(Date.now() - (stopTime - startTime));
            lastSaturationTimeRef.current = Date.now() - (stopTime - lastSaturationTimeRef.current);
        }
    }

    const stop = () => {
        setIsRunning(false);
        setStopTime(Date.now());
    };

    return (
        <div className={`${styles.canvas} ${styles.infoBar}`} style={{
            width: size.width,
            height: size.height,
            top: pos.y,
            left: pos.x,
        }}>
            <div style={{
                padding: "10px",
                boxSizing: "border-box",
                width: "100%",
            }} className={styles.controlBar}>
                <input type="number" defaultValue={localStorage.getItem("approximation.betaCoefficient") ?? 1} style={{
                    width: "100%",
                }} title={"Коэффициент радиуса"} onInput={
                    (e) => {
                        const value = e.currentTarget?.value;
                        setApproximationOptions(opt => {
                            if (e.currentTarget === undefined) {
                                return opt;
                            }
                            localStorage.setItem("approximation.betaCoefficient", value);
                            return {
                                ...opt,
                                betaCoefficient: parseFloat(value) || undefined,
                            }
                        });
                    }
                }/>
                <div>
                <Checkbox style={{
                    margin: "5px",
                    marginLeft: "0px",
                }} title={"«Ленивая» аппроксимация"} checked={localStorage.getItem("approximation.isLazy") === "true"} onChange={e => {
                    setApproximationOptions(opt => {
                        localStorage.setItem("approximation.isLazy", e.target.checked ? "true" : "false");
                        return {
                            ...opt,
                            isLazy: e.target.checked,
                        }
                    });
                }}/>
                <Checkbox style={{
                    margin: "5px",
                    marginLeft: "0px",
                }} title={"Единичное обслуживание"} defaultChecked onChange={e => {
                    setSingleServicing(e.target.checked);
                }}/>
                </div>
                <div className={styles.infoBarItem}>
                    Диаметр: {metricInfo.diameter.toFixed(2)}
                </div>
                <div className={styles.infoBarItem}>
                    Время:&nbsp;
                    <Time
                        startTime={startTime}
                        isRunning={isRunning}
                        step={10}
                        unit={'s'}
                        roundTo={2}
                        rememberLast
                        ref={timeRef}
                    />
                </div>
                <button onClick={() => {
                    setPoints([]);
                    setIsRunning(false);
                    setStartTime(-1);
                    timeRef.current?.reset();
                    setLastPointId(0);
                    setEdgesToService(undefined);
                    setServerMovement([serverMovementRef.current[0]]);
                }}>
                    Очистить
                </button>
                <div style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: "5px",
                }}>
                    <button
                        hidden={isRunning || edgesToService !== undefined}
                        style={{
                            backgroundColor: getCSSVariable("--accent-color"),
                            borderColor: getCSSVariable("--accent-color"),
                            flexGrow: 1,
                        }}
                        onClick={start}
                    >
                        Запустить
                    </button>
                    <button
                        style={{
                            flexGrow: 1,
                        }}
                        hidden={isRunning || edgesToService !== undefined}
                        onClick={reset}
                    >
                        Сбросить
                    </button>
                </div>
                <button
                    hidden={!isRunning}
                    style={{
                        backgroundColor: getCSSVariable("--accent-color"),
                        borderColor: getCSSVariable("--accent-color"),
                    }} onClick={stop}
                >
                    Остановить
                </button>
                <button
                    hidden={edgesToService === undefined}
                    style={{
                        backgroundColor: getCSSVariable("--accent-color"),
                        borderColor: getCSSVariable("--accent-color"),
                    }} onClick={() => {
                        if (edgesToService) {
                            ServiceEdges(serverMovementRef.current, edgesToService, treeRef.current.nodes, pointsRef.current, singleServicing);
                            setEdgesToService(undefined);
                            start();
                            setServerMovement([...serverMovementRef.current]);
                        }
                    }}
                >
                    Обслужить
                </button>
            </div>
            <InfoBarPoints pointsRef={pointsWatchedRef} popupRef={popupRef}/>
            <StringInputPopup ref={popupRef} onSubmit={(answer, id: number) => {
                const nodeFunction = parseExpression(answer);
                setPoints((oldPoints) => {
                    const points = [...oldPoints];
                    const point = points.find((p) => p.id === id);
                    if (point) {
                        point.expression = {
                            function: nodeFunction,
                            expression: answer,
                        };
                    }
                    return points;
                })
            }}/>
        </div>
    );
}

function InfoBarPoints({pointsRef: [pointsRef,points,setPoints], popupRef}: {pointsRef: WatchedRef<MarkedPoint[]>, popupRef: React.RefObject<PopupRef<number|string>|null>}) {
    return (
        <div className={styles.infoBarPointsContainer}>
            {pointsRef.current?.map((point) => (
                <div
                    key={point.id}
                    className={styles.infoBarItem}
                    onClick={() => {
                        setPoints(points.filter((p) => p.id !== point.id))
                    }}
                    onContextMenu={e => {
                        popupRef.current?.open(point.id, point.expression?.expression);
                        e.preventDefault();
                    }}
                >
                    {point.id}. ({point.x}; {point.y}): {point.expression?.expression ?? "x"} {point.expression?.lastX === undefined} = {formatNumber((point.expression?.function ?? (x => x))(point.expression?.lastX ?? 0))}
                </div>
            ))}
        </div>
    )
}
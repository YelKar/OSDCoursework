import {CanvasProps} from "../OSDCanvases";
import styles from "../OSD.common.module.css";
import {Options as ApproximationOptions} from "../algorithm/approximation";
import React, {Dispatch, SetStateAction, useContext, useEffect} from "react";
import Checkbox from "../../../utils/Checkbox";
import {assertExists, getCSSVariable} from "../../../utils/util";
import {OSDContext} from "../OSD";
import {useNavigate} from "react-router-dom";

type OSDInfoBarProps = CanvasProps & {
    setApproximationOptions: Dispatch<SetStateAction<ApproximationOptions>>;
};

export default function ApproximationInfoBar({
    pos, size,
    setApproximationOptions,
}: OSDInfoBarProps) {
    const navigate = useNavigate();
    const {pointsRef: [pointsRef, points, setPoints], treeRef: [,{metricInfo},]} = assertExists(useContext(OSDContext));
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
                <div className={styles.infoBarItem}>
                    Диаметр: {metricInfo.diameter.toFixed(2)}
                </div>
                <button onClick={() => {
                    setPoints([]);
                }}>
                    Очистить
                </button>
                <button style={{
                    backgroundColor: getCSSVariable("--accent-color"),
                    borderColor: getCSSVariable("--accent-color"),
                }} onClick={() => {
                    navigate("../saturation");
                }}>
                    Продолжить
                </button>
            </div>
            <div className={styles.infoBarPointsContainer}>
                {pointsRef.current?.map((point, index) => (
                    <div key={index} className={styles.infoBarItem} onClick={() => {
                        setPoints(points.filter((_, i) => i !== index))
                    }}>
                        {index}. ({point.x}; {point.y})
                    </div>
                ))}
            </div>
        </div>
    );
}
import React, {useEffect, useImperativeHandle, useState} from 'react';

type TimeProps = {
    startTime: number;
    isRunning: boolean;
    step?: number;
    unit?: 'ms' | 's' | 'm' | 'h';
    roundTo?: number;
    rememberLast?: boolean;
};

export type TimeHandle = {
    reset: () => void;
};

const timeUnits = {
    ms: 1,
    s: 1000,
    m: 60000,
    h: 3600000,
};

function Time({ startTime, isRunning, step, unit, roundTo, rememberLast }: TimeProps, ref: React.ForwardedRef<TimeHandle>) {
    const [elapsed, setElapsed] = useState(0);

    useImperativeHandle(ref, () => ({
        reset: () => setElapsed(0),
    }));

    useEffect(() => {
        let interval: number | null = null;

        if (isRunning) {
            interval = window.setInterval(() => {
                setElapsed(Date.now() - startTime);
            }, step ?? 100);
        } else if (!rememberLast) {
            setElapsed(0);
        }

        return () => {
            if (interval !== null) {
                clearInterval(interval);
            }
        };
    }, [isRunning, startTime]);

    return (
        <span>
            {(elapsed / timeUnits[unit ?? 'ms']).toFixed(roundTo ?? (unit === "ms" || !unit ? 0 : 3))} {unit ?? 'ms'}
        </span>
    );
}

export default React.forwardRef(Time);
import React, {Dispatch, SetStateAction, useRef, useState} from "react";

export type WatchedRef<T> = [React.RefObject<T>, T, Dispatch<SetStateAction<T>>];

export default function useWatchedRef<T>(initialValue: T): WatchedRef<T> {
    const ref = useRef<T>(initialValue);
    const [state, setState] = useState<T>(initialValue);

    const set = (val: T | ((prevState: T) => T)) => {
        setState((prevState: T) => {
            if (typeof val === "function") {
                ref.current = (val as (prevState: T) => T)(prevState);
            } else {
                ref.current = val;
            }
            return ref.current;
        });
    };

    return [ref, state, set];
}
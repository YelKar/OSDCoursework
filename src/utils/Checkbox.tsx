import { useRef, useEffect, InputHTMLAttributes } from 'react';
import styles from './Checkbox.module.css';

type CheckboxProps = InputHTMLAttributes<HTMLInputElement> & {
    indeterminate?: boolean;
};

function Checkbox({ indeterminate = false, ...props }: CheckboxProps) {
    const ref = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.indeterminate = indeterminate;
        }
    }, [indeterminate]);

    return <label className={`${styles.label} ${props.className}`} style={props.style} title={props.title}>
        <input className={styles.input} type="checkbox" ref={ref} {...props} />
    </label>;
}

export default Checkbox;

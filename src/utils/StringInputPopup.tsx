import React, {
    forwardRef,
    useImperativeHandle,
    useState,
} from 'react';

export type PopupRef<T> = {
    open: (options: T, defaultValue?: string) => void;
};

type Props<T> = {
    onSubmit: (answer: string, options: T) => void;
};

function StringInputPopupInner<T>({ onSubmit }: Props<T>, ref: React.Ref<PopupRef<T>>) {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [options, setOptions] = useState<T | null>(null);

    const handleOk = () => {
        if (options !== null) {
            onSubmit(input, options);
        }
        setInput('');
        setIsOpen(false);
    };

    useImperativeHandle(ref, () => ({
        open: (optionsArg: T, defaultValue?: string) => {
            setOptions(optionsArg);
            setInput(defaultValue ?? "");
            setIsOpen(true);
        }
    }));

    return isOpen ? (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: "var(--primary-color)",
                padding: '20px',
                borderRadius: '10px',
                minWidth: '300px'
            }}>
                <h3>Введите строку</h3>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    style={{ width: '100%', marginBottom: '10px' }}
                />
                <div style={{ textAlign: 'right' }}>
                    <button onClick={() => setIsOpen(false)} style={{ marginRight: '10px' }}>Отмена</button>
                    <button onClick={handleOk}>OK</button>
                </div>
            </div>
        </div>
    ) : null;
}

export const StringInputPopup = forwardRef(StringInputPopupInner) as <T>(
    props: Props<T> & { ref?: React.Ref<PopupRef<T>> }
) => React.ReactElement;

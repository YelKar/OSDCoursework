export function assertExists<T>(value: T | null | undefined, message?: string): T {
    if (value === null || value === undefined) {
        throw new Error(message ?? 'Expected value to be defined');
    }
    return value;
}

export function getCSSVariable(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name);
}

export function formatNumber(n: number): string {
    const abs = Math.abs(n);

    const needsExponential = n.toString().includes("e") || abs > 1e10;
    if (needsExponential) {
        return n.toExponential(2);
    } else {
        return n.toFixed(2);
    }
}
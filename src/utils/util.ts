export function assertExists<T>(value: T | null | undefined, message?: string): T {
    if (value === null || value === undefined) {
        throw new Error(message ?? 'Expected value to be defined');
    }
    return value;
}

export function getCSSVariable(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name);
}

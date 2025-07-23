export default function parseExpression(expr: string): (x: number) => number {
    expr = expr.replace(/\s+/g, '');

    const terms = expr.match(/[+-]?[^+-]+/g);

    if (!terms) {
        throw new Error('Невозможно распарсить выражение');
    }

    const termFunctions = terms.map(term => {
        const matchPower = term.match(/^([+-]?\d*\.?\d*)x\^(\d+)$/);
        if (matchPower) {
            const [, coefStr, powerStr] = matchPower;
            const coef = parseFloat(coefStr || (coefStr === '-' ? '-1' : '1'));
            const power = parseInt(powerStr);
            return (x: number) => coef * x ** power;
        }

        const matchLinear = term.match(/^([+-]?\d*\.?\d*)x$/);
        if (matchLinear) {
            const [, coefStr] = matchLinear;
            const coef = parseFloat(coefStr || (coefStr === '-' ? '-1' : '1'));
            return (x: number) => coef * x;
        }

        const matchConst = term.match(/^([+-]?\d+\.?\d*)$/);
        if (matchConst) {
            const [, constStr] = matchConst;
            const value = parseFloat(constStr);
            return (_: number) => value;
        }

        throw new Error(`Не удалось распознать слагаемое: ${term}`);
    });

    return (x: number) => termFunctions.reduce((sum, f) => sum + f(x), 0);
}

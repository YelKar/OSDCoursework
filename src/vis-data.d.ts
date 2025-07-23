// src/vis-data.d.ts

// Расширяем (ambient) модуль vis-data
declare module 'vis-data' {
    // базовый интерфейс для узла и ребра — вы можете его расширить по‑своему
    export interface Node {
        id: string | number;
        label?: string;
        // ... ваши дополнительные поля
    }

    export interface Edge {
        from: string | number;
        to: string | number;
        label?: string;
        // ... ваши дополнительные поля
    }

    // Класс DataSet<T> с основными методами
    export class DataSet<T = any> {
        constructor(data?: T[]);
        add(item: T): void;
        add(items: T[]): void;
        update(item: Partial<T> & Pick<T, 'id'>): void;
        remove(T): void;
        get(): T[];
        get(id: string | number): T;
        get(ids: Array<string | number>): T[];
        // …допишите ещё методы, которые вам нужны
    }
}

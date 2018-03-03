export interface LazyImageAdapter<T> {
    setPath(path: string): void;
    getPath(): string;
    setStyle(style: string, value: any): void;
    getRef(): T;
}
export interface Formattable<T> {
    toString(formatter?: (value: T) => string): void;
}

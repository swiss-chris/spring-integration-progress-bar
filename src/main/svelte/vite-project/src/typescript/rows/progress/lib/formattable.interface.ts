interface Formattable<T> {
    format(formatter: (value: T) => string): void;
}

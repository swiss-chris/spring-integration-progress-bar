export class ArrayUtils {
    // returns the index where the new number should be inserted into the array to preserve sorting (ascending
    // or descending, depending on the last parameter)
    static getInsertionIndex(numbers: number[], newNumber: number, ascending = true) {
        const compareFn = (a: number, b: number) => ascending ? (a - b) : (b - a);
        return numbers.concat(newNumber).sort(compareFn).indexOf(newNumber);
    }
}

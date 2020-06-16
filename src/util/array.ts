export function chunk<T>(array: T[], size: number): T[][] {
    const chunkedArr:T[][] = [];

    for (let i = 0; i < array.length; i += 1) {
        const last: T[] = chunkedArr[chunkedArr.length - 1];

        if (!last || last.length === size) {
            chunkedArr.push([array[i]]);
        } else {
            last.push(array[i]);
        }
    }

    return chunkedArr;
}

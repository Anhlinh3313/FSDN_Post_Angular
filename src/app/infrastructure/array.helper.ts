export class ArrayHelper {
    static isNullOrZero(arr: any[]): boolean {
        if (!arr) {
            return true;
        } else {
            if (arr.length === 0) {
                return true;
            }
            return false;
        }
    }
}
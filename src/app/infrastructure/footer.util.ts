export class FooterUtil {
    static sum( listData, columnName) {
        return !listData ? 0 : listData.map(x => x[columnName]).reduce((x, y) => x + y, 0);
    }
}
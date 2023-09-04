import { PriceService } from "./priceService.model";
import { PriceUploadExcel } from "./priceUploadExcel.model";
export class PriceServiceDetailExcelViewModel {
    areaCodes: string[] = [];
    WeightCodes:string[] = [];
    priceService : PriceService = new PriceService();
    priceUploadExcel: PriceUploadExcel[] = [];
}
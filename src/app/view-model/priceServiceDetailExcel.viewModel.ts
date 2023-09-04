import { PriceService } from "../models/priceService.model";
import { PriceUploadExcelViewModel } from "./priceUploadExcel.viewModel";
export class PriceServiceDetailExcelViewModel {
    areaCodes: string[] = [];
    WeightCodes:string[] = [];
    priceServiceViewModel: PriceService = new PriceService();
    priceUploadExcelViewModel: PriceUploadExcelViewModel[] = [];
}
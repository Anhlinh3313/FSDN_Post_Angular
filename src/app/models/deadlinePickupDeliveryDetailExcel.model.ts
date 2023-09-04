import { PriceUploadExcel } from "./priceUploadExcel.model";
import { DeadlinePickupDeliveryService } from "../services/index";
import { DeadlinePickupDelivery } from "./deadlinePickupDelivery.model";
import { DeadlinePickupDeliveryDetailExcel } from "./deadlinePickupDeliveryUploadExcel.model";
export class DeadlinePickupDeliveryDetailExcelViewModel {
    areaCodes: string[] = [];
    serviceCodes:string[] = [];
    deadlinePickupDeliveryViewModel : DeadlinePickupDelivery = new DeadlinePickupDelivery();
    deadlineUploadExcelViewModels: DeadlinePickupDeliveryDetailExcel[] = [];
}
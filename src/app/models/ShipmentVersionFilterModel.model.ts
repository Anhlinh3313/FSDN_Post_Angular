import { GeneralModel } from "./general.model"; 
import { CustomExportFileModel } from "./CustomExportFile.model";

export class ShipmentVersionFilterModel  extends GeneralModel {
    dateFrom?: any;
	dateTo?: any ;
	hubId?: number;
	senderId?: number;
	empId?: number;
	shipmentNumber?: string;
	pageNumber?: number;
	pageSize?: number;
	isShortByCOD?: any;
	customExportFile: CustomExportFileModel = new CustomExportFileModel();
}
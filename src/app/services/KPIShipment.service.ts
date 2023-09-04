import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient, HttpParams } from "@angular/common/http";
import { ResponseModel } from '../models/response.model';
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { MessageService } from 'primeng/components/common/messageservice';
import { SelectModel } from '../models/select.model';

@Injectable()
export class KPIShipmentServices extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "KPIShipment");
  }
  
  public createKPIShipmentCus(model: any): Observable<ResponseModel> {
    return super.postCustomApi("CreateKPIShipmentCus", model);
  }

  getKPIShipmentCusByKPIShipemt(kPIshipemntId: any) {
    let params = new HttpParams();
    params = params.append("request", kPIshipemntId);
    return super.getCustomApi("GetKPIShipmentCusByKPIShipemt", params)
  }
  async getKPIShipmentSelectModelAsync(): Promise<SelectModel[]> {
    const data = await this.getAllAsync();
    if (data.isSuccess) {
      let KPIShipments: SelectModel[] = [];
      KPIShipments.push({ label: `-- Chọn --`, data: null, value: null });
      data.data.forEach(element => {
        KPIShipments.push({
          label: `${element.code} - ${element.name}`,
          data: element,
          value: element.id
        });
      });
      return KPIShipments;
    } else {
      return null;
    }
  }  
}
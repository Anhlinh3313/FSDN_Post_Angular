import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient, HttpParams } from "@angular/common/http";
import { ResponseModel } from '../models/response.model';
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class KPIShipmentDetailServices extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "KPIShipmentDetail");
  }

  getKPIShipmentDetail(kPIshipemntId: any, pageNumber?: any, pageSize?: any) {
    let params = new HttpParams();
    params = params.append("kPIshipemntId", kPIshipemntId);
    params = params.append("pageNumber", pageNumber);
    params = params.append("pageSize", pageSize);
    return super.getCustomApi("GetKPIShipmentDetail", params)
  }

  public upLoadKPIShipmentDetail(model: any): Observable<ResponseModel> {
    return super.postCustomApi("UpLoadKPIShipmentDetail", model);
  }
  public updateKPIShipmentDetail(model: any): Observable<ResponseModel> {
    return super.postCustomApi("UpdateKPIShipmentDetail", model);
  }
}
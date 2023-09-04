import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
import { ResponseModel } from '../models/response.model';
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { DataFilterViewModel } from '../view-model/index';
import { DeadlinePickupDeliveryDetailExcelViewModel } from '../models/deadlinePickupDeliveryDetailExcel.model';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class DeadlinePickupDeliveryDetailService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "deadlinePickupDeliveryDetail");
  }

  public GetByDeadlinePickupDelivery(dataFilter: DataFilterViewModel): Observable<ResponseModel> {
    return super.postCustomApi("GetByDeadlinePickupDelivery", dataFilter);
  }

  public UploadExcelDeadline(dataExcels: DeadlinePickupDeliveryDetailExcelViewModel): Observable<ResponseModel> {
    return super.postCustomApi("UploadExcelDeadline", dataExcels);
  }
}
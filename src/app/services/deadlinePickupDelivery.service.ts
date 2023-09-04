import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
import { ResponseModel } from '../models/response.model';
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { DeadlinePickupDelivery } from '../models/deadlinePickupDelivery.model';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class DeadlinePickupDeliveryService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "deadlinePickupDelivery");
  }

  public getDeadlineDelivery(model: DeadlinePickupDelivery): Observable<ResponseModel> {
    return super.postCustomApi("deadlineDelivery", model);
  }

  async getDeadlineDeliveryAsync(model: DeadlinePickupDelivery): Promise<DeadlinePickupDelivery> {
    const res = await this.getDeadlineDelivery(model).toPromise();
    if (res.isSuccess) {
      const data = res.data as DeadlinePickupDelivery;
      return data;
    } else {
      return null;
    }
  }
}
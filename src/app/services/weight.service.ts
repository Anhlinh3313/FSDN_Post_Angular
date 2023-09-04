import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";

import { Weight } from '../models/weight.model';
import { ResponseModel } from '../models/response.model';
import { GeneralService } from './general.service';
import { environment } from '../../environments/environment';
import { PersistenceService } from 'angular-persistence';
import { HttpParams } from '@angular/common/http';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class WeightService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "weight");
  }

  public GetByWeightGroup(weightGroupId:any, priceServiceId?:any): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("weightGroupId", weightGroupId);
    params = params.append("priceServiceId", priceServiceId);
    return super.getCustomApi("GetByWeightGroup", params);
  }

  async getByWeightGroupAsync(weightGroupId:any, priceServiceId?:any): Promise<Weight[]> {
    const res = await this.GetByWeightGroup(weightGroupId,priceServiceId).toPromise();
    if(!this.isValidResponse(res)) return;
    const data = res.data as Weight[];
    return data;
  }
  //
  updateWeights(model: Weight[]) {
    return super.postCustomApi("UpdateWeights", model);
  }
  async updateWeightsAsync(model: Weight[]): Promise<Weight[]> {
    const res = await this.updateWeights(model).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as Weight[];
    return data;
  }
  //
  deleteWeight(model: Weight){
    return super.postCustomApi("DeleteWeight", model);
  }

  async deleteAWeightAsync(model: Weight): Promise<Weight>{
    const res = await this.deleteWeight(model).toPromise();
    if(!this.isValidResponse(res)) return;
    const data = res.data as Weight;
    return data;
  }
}

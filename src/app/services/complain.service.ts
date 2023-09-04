import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from "@angular/common/http";
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { MessageService } from 'primeng/components/common/messageservice';
import { ComplainFilter } from '../models/complainFilter.model';
import { SelectModel } from '../models/select.model';
import { ComplainStatus } from '../models/complainStatus.model';
import { ComplainHandleFilter } from '../models/complainHandleFilter.model';
import { AddComplainHandle } from '../models/addComplainHandle.model';

@Injectable({
  providedIn: 'root'
})
export class ComplainService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "complain");
  }

  async getComplainBy(shipmentComplainFilter: ComplainFilter) {
    let res = await this.postCustomApi("GetComplainBy", shipmentComplainFilter).toPromise();
    return res;
  }

  async getComplainHandle(complainHandleFilter: ComplainHandleFilter) {
    let params = new HttpParams();
    params = params.append("complainId", complainHandleFilter.complainId.toString());
    params = params.append("pageNum", complainHandleFilter.pageNum.toString());
    params = params.append("pageSize", complainHandleFilter.pageSize.toString());
    params = params.append("cols", complainHandleFilter.cols);

    let res = await this.getCustomApi("GetComplainHandle", params).toPromise();

    return res;
  }

  async getSelectModelComplainStatusAsync(): Promise<SelectModel[]> {
    const res = await this.get("GetComplainStatus").toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as ComplainStatus[];
    if (data) {
      const selectModel: SelectModel[] = [];
      selectModel.push({ label: `-- Chọn trung tâm --`, data: null, value: null });
      data.forEach(element => {
        selectModel.push({
          label: `${element.code} - ${element.name}`,
          value: element.id
        });
      });
      return selectModel;
    }
  }

  async getSelectModelComplainStatusMultiSelectAsync(): Promise<SelectModel[]> {
    const res = await this.getCustomApi("GetComplainStatus", null).toPromise();
    if (!this.isValidResponse(res)) return;
    const data = res.data as ComplainStatus[];
    if (data) {
      const selectModel: SelectModel[] = [];
      data.forEach(element => {
        selectModel.push({
          label: `${element.code} - ${element.name}`,
          value: element.id
        });
      });
      return selectModel;
    }
  }

  async addComplainHandle(model: AddComplainHandle) {
    const res = await this.postCustomApi("AddComplainHandle", model).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data;
  }
}

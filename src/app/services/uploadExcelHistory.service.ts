import { Injectable } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";
import { ResponseModel } from '../models/response.model';
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { HttpParams } from '@angular/common/http';
import { MessageService } from 'primeng/components/common/messageservice';
import { UploadExcelHistoryViewModel } from '../models/abstract/uploadExcelHistoryViewModel.interface';
import { SelectItem } from 'primeng/primeng';
import * as moment from "moment";

@Injectable()
export class UploadExcelHistoryService extends GeneralService {
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "uploadExcelHistory");
  }

  getHistory(fromDate?: any, toDate?: any, cols?: string): Observable<ResponseModel> {
    let params = new HttpParams();
    params = params.append("fromDate", fromDate);
    params = params.append("toDate", toDate);
    params = params.append("cols", cols);
    return super.getCustomApi("getHistory", params);
  }

  async getHistoryAsync(fromDate?: any, toDate?: any, cols?: string): Promise<ResponseModel> {
    const res = await this.getHistory(fromDate, toDate, cols).toPromise();
    if(!this.isValidResponse(res)) return;
    return res;
  }

  async getHistorySelectItemAsync(fromDate?: any, toDate?: any, cols?: string): Promise<SelectItem[]> {
    const res = await this.getHistoryAsync(fromDate, toDate, cols);
    const uploadExcelHisoty: SelectItem[] = [];
    if (!res.isSuccess) {
      return null;
    }
    const data = res.data as UploadExcelHistoryViewModel[];
    uploadExcelHisoty.push({ label: "-- Chọn tất cả --", value: null });
    data.forEach(element => {
      if (element) {
        if (element.user) {
          uploadExcelHisoty.push({
            label: element.user.code + " - " + element.user.fullName + " - " +
            moment(element.createdWhen).format(environment.formatDateTime) + " - " + element.totalCreated,
            value: element.id
          });
        }
      }
    });
    return uploadExcelHisoty;
  }
}

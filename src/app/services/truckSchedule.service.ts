import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { GeneralService } from './general.service';
import { environment } from '../../environments/environment';
import { PersistenceService } from 'angular-persistence';
import { HttpParams } from '@angular/common/http';
import { MessageService } from 'primeng/components/common/messageservice';
import { TruckSchedule } from '../models/truckSchedule.model';
import { Constant } from '../infrastructure/constant';
import { TruckScheduleFilter } from '../models/truckScheduleFilter.model';

@Injectable()
export class TruckScheduleService extends GeneralService {
    constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
        super(messageService, httpClient, persistenceService, environment.apiPostUrl, "TruckSchedule");
    }

    public async GetByCode(code: string, cols: string[]) {
        let params = new HttpParams();
        params = params.append("code", code);
        if (cols.length > 0)
            params = params.append("cols", cols.join(","));

        return await this.getCustomApi("GetByCode", params).toPromise();
    }

    public async searchTruckScheduleByTruckNumber(model: any) {
        let res = await this.postCustomApi("SearchTruckScheduleByTruckNumber", model).toPromise();
        if (!this.isValidResponse(res)) return;
        return res.data;
    }

    public async searchTruckSchedule(model: TruckScheduleFilter) {
        let res = await this.postCustomApi("SearchTruckSchedule", model).toPromise();
        if (!this.isValidResponse(res)) return;
        return res;
    }

    public async getTruckScheduleDetail(truckScheduleId: any, cols: string) {
        let params = new HttpParams();
        params = params.append("truckScheduleId", truckScheduleId);
        params = params.append("cols", cols);

        let res = await this.getCustomApi("GetTruckScheduleDetail", params).toPromise();
        if (!this.isValidResponse(res)) return;
        return res.data;
    }

    public async CloseSeal(model: any) {
        return await this.postCustomApi("CloseSeal", model).toPromise();
    }

    public async OpenSeal(model: any) {
        return await this.postCustomApi("OpenSeal", model).toPromise();
    }

    public async GetListByTruckNumber(truckNumber: string, cols: string[]) {
        let params = new HttpParams();
        params = params.append("truckNumber", truckNumber);
        if (cols.length > 0)
            params = params.append("cols", cols.join(","));

        return await this.getCustomApi("GetListByTruckNumber", params).toPromise();
    }

    public async GetSelectModelByTruckNumber(truckNumber: string, cols: string[]) {
        let res = await this.GetListByTruckNumber(truckNumber, cols);

        const selectModel = [];
        const datas = res.data as TruckSchedule[];

        selectModel.push({ label: "-- Chọn dữ liệu --", data: null, value: null });

        if (res.isSuccess) {
            datas.forEach(element => {
                selectModel.push({
                    label: `${element.name}`,
                    data: element,
                    value: element.id
                });
            });
            return selectModel;
        }
        else {
            this.messageService.add({
                severity: Constant.messageStatus.warn,
                detail: res.message
            });
            return;
        }
    }
}

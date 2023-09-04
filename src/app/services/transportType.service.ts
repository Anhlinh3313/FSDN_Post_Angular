import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { GeneralService } from './general.service';
import { PersistenceService } from 'angular-persistence';
import { environment } from '../../environments/environment';
import { TransportType } from '../models/transportType.model';
import { SelectModel } from '../models/select.model';
import { MessageService } from 'primeng/components/common/messageservice';

@Injectable()
export class TransportTypeService extends GeneralService {
    transportType: SelectModel[];
  constructor(protected messageService: MessageService, protected httpClient: HttpClient, protected persistenceService: PersistenceService) {
    super(messageService, httpClient, persistenceService, environment.apiPostUrl, "transportType");
  }

    async getAllTransportTypeAsync(arrCols: string[] = []): Promise<TransportType[]> {
        const res =  await this.getAll(arrCols).toPromise();
        if (res.isSuccess) {
            const data = res.data as TransportType[];
            return data;
        } else {
            return null;
        }
    } 

    async getSelectModelTransportTypeAsync(arrCols: string[] = []): Promise<SelectModel[]> {
        const res = await this.getAllTransportTypeAsync(arrCols);
        const transportType: SelectModel[] = [];
        transportType.push({ label: "--Chọn HT trung chuyển--", title: null, data: null, value: null });
        if (res) {
            res.forEach(element => {
                if (element.isRequiredTPL) {
                    if (element.tplTransportTypes.length > 0) {
                        element.tplTransportTypes.forEach(x => {
                            if (x.tpl) {
                                transportType.push({ label: `${x.tpl.code} - ${element.name}`, title: element.code, data: x.tpl.id, value: {transportTypeId: element.id, tplId: x.tpl.id} });
                            }
                        });
                    }                    
                } else {
                    transportType.push({ label: element.name + " (NB)", title: element.code, data: null, value: {transportTypeId: element.id, tplId: null} });
                    if (element.tplTransportTypes.length > 0) {
                        element.tplTransportTypes.forEach(x => {
                            if (x.tpl) {
                                transportType.push({ label: `${x.tpl.code} - ${element.name}`,  title: element.code, data: x.tpl.id, value: {transportTypeId: element.id, tplId: x.tpl.id} });
                            }
                        });
                    }
                }
            });
            return transportType;
        } else {
          return null;
        }
    }    

    getAllTransportType(arrCols: string[] = []) {
      return this.getAll(arrCols).map(x => {
        let data = x.data as TransportType[];
        this.transportType = [];
        this.transportType.push({ label: "--Chọn HT trung chuyển--", title: null, data: null, value: null });
        if (data) {
            data.forEach(element => {
                if (element.isRequiredTPL) {
                    if (element.tplTransportTypes.length > 0) {
                        element.tplTransportTypes.forEach(x => {
                            if (x.tpl) {
                                this.transportType.push({ label: `${x.tpl.code} - ${element.name}`, title: element.code, data: x.tpl.id, value: element.id });
                            }
                        });
                    }                    
                } else {
                    this.transportType.push({ label: element.name + " (NB)", title: element.code, data: null, value: element.id });
                    if (element.tplTransportTypes.length > 0) {
                        element.tplTransportTypes.forEach(x => {
                            if (x.tpl) {
                                this.transportType.push({ label: `${x.tpl.code} - ${element.name}`,  title: element.code, data: x.tpl.id, value: element.id });
                            }
                        });
                    }
                }
            });
        }
        return this.transportType;
      });
    }
}
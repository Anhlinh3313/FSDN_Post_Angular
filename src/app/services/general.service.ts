import { Injectable } from "@angular/core";
import { Observable } from "rxjs/Observable";
import { HttpClient } from "@angular/common/http";

import { ResponseModel } from "../models/response.model";
import { HttpParams } from "@angular/common/http";
import { BaseService } from "./base.service";
import { PersistenceService } from "angular-persistence";
import { SelectModel } from "../models/select.model";
import { MessageService } from "primeng/components/common/messageservice";
import { Shipment } from "../models";

//@Injectable()
export class GeneralService extends BaseService {
  constructor(
    protected messageService: MessageService,
    protected httpClient: HttpClient,
    protected persistenceService: PersistenceService,
    protected urlName: string,
    protected apiName: string
  ) {
    super(messageService, httpClient, persistenceService, urlName, apiName);
  }

  async getAsync(id: any, arrCols: string[] = []): Promise<ResponseModel> {
    return await this.get(id, arrCols).toPromise();
  }

  async getAllSelectModelAsync(): Promise<SelectModel[]> {
    const res = await this.getAll().toPromise();
    if (res.isSuccess) {
      const selectModel = [];
      const datas = res.data as any[];

      selectModel.push({ label: "-- Chọn dữ liệu --", data: null, value: null });
      datas.forEach(element => {
        selectModel.push({
          label: `${element.code} - ${element.name}`,
          data: element,
          value: element.id
        });
      });
      return selectModel;
    }
  }

  async getAllSelectModelValueCodeAsync(): Promise<SelectModel[]> {
    const res = await this.getAll().toPromise();
    if (res.isSuccess) {
      const selectModel = [];
      const datas = res.data as any[];

      selectModel.push({ label: "-- Chọn dữ liệu --", data: null, value: null });
      datas.forEach(element => {
        selectModel.push({
          label: `${element.code} - ${element.name}`,
          data: element,
          value: element.code
        });
      });
      return selectModel;
    }
  }

  async getAllSelectModelListGoodAsync(): Promise<any[]> {
    const res = await this.getAllAsync();
    if (res["length"] > 0) {
      const selectModel = [];
      const datas = res as any[];

      selectModel.push({ label: "-- Chọn dữ liệu --", data: null, value: null });
      datas.forEach(element => {
        if (element) {
          selectModel.push({
            label: `${element.code} - ${element.name}`,
            data: element,
            value: element.id
          });
        }
      });
      return selectModel;
    }
  }

  public get(id: any, arrCols: string[] = []): Observable<ResponseModel> {
    let params = new HttpParams();
    let cols = null;

    params = params.append("id", id);

    if (arrCols.length > 0) {
      cols = arrCols.join(",");
    }

    if (cols) params = params.append("cols", cols);
    return this.httpClient.get<ResponseModel>(
      `${this.urlName}/${this.apiName}/get`,
      { params: params }
    );
  }

  async getAllAsync(
    arrCols: string[] = [],
    pageSize: number = 0,
    pageNumber: number = 0
  ): Promise<any> {
    return await this.getAll(arrCols, pageSize, pageNumber).toPromise();
  }

  public getAll(
    arrCols: string[] = [],
    pageSize: number = 0,
    pageNumber: number = 0
  ): Observable<ResponseModel> {
    let params = new HttpParams();
    if (!pageSize && !pageNumber && arrCols.length === 0) {
      return this.httpClient.get<ResponseModel>(
        `${this.urlName}/${this.apiName}/getAll`
      );
    } else {
      let cols = null;

      if (arrCols.length > 0) {
        cols = arrCols.join(",");
      }

      if (pageSize) params = params.append("pageSize", pageSize + "");
      if (pageNumber) params = params.append("pageNumber", pageNumber + "");
      if (cols) params = params.append("cols", cols);

      return this.httpClient.get<ResponseModel>(
        `${this.urlName}/${this.apiName}/getAll`,
        { params: params }
      );
    }
  }

  async createAsync(model: Object): Promise<ResponseModel> {
    return await this.create(model).toPromise();
  }

  public create(model: Object): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(
      `${this.urlName}/${this.apiName}/create`,
      model
    );
  }

  async updateAsync(model: Object): Promise<ResponseModel> {
    return await this.update(model).toPromise();
  }

  public update(model: Object): Observable<ResponseModel> {
    // console.log(JSON.stringify(model));
    return this.httpClient.post<ResponseModel>(
      `${this.urlName}/${this.apiName}/update`,
      model
    );
  }

  async uploadExcelShipmentAsync(shipments: Shipment[]): Promise<ResponseModel> {
    return await this.uploadExcelShipment(shipments).toPromise();
  }

  public uploadExcelShipment(shipments: Shipment[]): Observable<ResponseModel> {
    // console.log(JSON.stringify(model));
    return this.httpClient.post<ResponseModel>(
      `${this.urlName}/${this.apiName}/uploadExcel`,
      shipments
    );
  }

  async deleteAsync(model: Object): Promise<ResponseModel> {
    return await this.delete(model).toPromise();
  }

  async searchByNamePaging(keySearch: any = "", pageNum: number = 1, pageSize: number = 20, cols: string = "") {
    let params = new HttpParams();

    params = params.append("keySearch", keySearch);
    params = params.append("pageSize", pageSize + "");
    params = params.append("pageNumber", pageNum + "");
    params = params.append("cols", cols);

    let res = await this.httpClient.get<ResponseModel>(`${this.urlName}/${this.apiName}/${"SearchByNamePaging"}`, { params: params }).toPromise();
    if (!this.isValidResponse(res)) return;
    return res.data;
  }

  public delete(model: Object): Observable<ResponseModel> {
    return this.httpClient.post<ResponseModel>(
      `${this.urlName}/${this.apiName}/delete`,
      model
    );
  }
}

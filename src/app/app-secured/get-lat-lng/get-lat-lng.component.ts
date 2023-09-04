import { Component, OnInit } from '@angular/core';
import { GeocodingApiService } from '../../services/geocodingApiService.service';
import { ProvinceService, DistrictService, WardService } from '../../services';
import { Province, District, Ward } from '../../models';
import { MapsAPILoader } from '@agm/core';
import { BaseComponent } from '../../shared/components/baseComponent';
import { MessageService } from 'primeng/components/common/messageservice';
import { PermissionService } from '../../services/permission.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-get-lat-lng',
  templateUrl: './get-lat-lng.component.html',
  styles: []
})
export class GetLatLngComponent extends BaseComponent implements OnInit {

  listProvinces: Province[];
  listDistrict: District[];
  listWard: Ward[];

  loading: string = "";

  constructor(public mapsAPILoader: MapsAPILoader,
    public geocodingApiService: GeocodingApiService,
    public provinceService: ProvinceService,
    public districtService: DistrictService,
    public wardService: WardService,
    public messageService: MessageService,
    public permissionService: PermissionService, 
    public router: Router,
  ) {
    super(messageService,permissionService,router);
    }

  ngOnInit() {
    this.GetAllProvince();
    this.GetAllDistrict();
    this.GetAllWard();
  }

  async getLatLngFromAddress() {
    await Promise.all(this.listProvinces.map(async (province, i) => {
      await this.mapsAPILoader.load().then(async () => {
        let place = await this.geocodingApiService.findFromAddressAsync(province.name);

        let update = await this.provinceService.updateAsync({
          "countryId": province.countryId,
          "lat": place.geometry.location.lat(),
          "lng": place.geometry.location.lng(),
          "country": province.country,
          "id": province.id,
          "code": province.code,
          "name": province.name,
          "concurrencyStamp": province.concurrencyStamp,
          "isEnabled": province.isEnabled
        })

        this.loading = `${i}/${this.listProvinces.length}`
        console.log(province);
        console.log(place);
        console.log(update);
      })
    }))
  }

  async GetAllProvince() {
    let res = await this.provinceService.getAll().toPromise();
    if (res.isSuccess) {
      this.listProvinces = res.data as Province[];
    }
  }

  async GetAllDistrict() {
    let res = await this.districtService.getAll().toPromise();
    if (res.isSuccess) {
      this.listDistrict = res.data as District[];
    }
  }

  async GetAllWard() {
    let res = await this.wardService.getAll().toPromise();
    if (res.isSuccess) {
      this.listWard = res.data as Ward[];
    }
  }
}

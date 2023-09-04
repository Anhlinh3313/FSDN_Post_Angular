// import { MessagingService } from './messaging.service';
import { Component } from '@angular/core';
import { VersionCheckService } from './services/version-check.service';
import { Http } from "@angular/http";

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
})
export class AppComponent {
  displayVersion: boolean = false;
  title = 'app';
  message: string = "Hệ thống POST cập nhật version mới. Vui lòng chờ trong giây lát...";

  constructor(
    private versionCheckService: VersionCheckService,
    private http: Http
    
  ) {}

  async ngOnInit() {
    // setInterval(() => {
    //   this.versionCheckService.initVersionCheck("assets/version.json").then(
    //     x => {
    //       if (x) {
    //         this.displayVersion = true;
    //         setTimeout(() => {
    //           this.displayVersion = false;
    //           window.location.reload(true);
    //         }, 10000);
    //       }
    //     }
    //   );
    // }, 60000);
  }
}
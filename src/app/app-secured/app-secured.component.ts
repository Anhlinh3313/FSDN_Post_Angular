import { Component, OnInit } from '@angular/core';
import { PersistenceService, StorageType } from 'angular-persistence';
import { Constant } from '../infrastructure/constant';
import { environment } from '../../environments/environment';
import { EventListenerServiceInstance } from '../services/eventListener.serviceInstance';

declare var jQuery: any;

@Component({
  selector: 'app-secured',
  templateUrl: 'app-secured.component.html',
  styles: []
})
export class AppSecuredComponent implements OnInit {
  blockedDocument: boolean = false;

  constructor(
    private eventListenerServiceInstance: EventListenerServiceInstance,
    private persistenceService: PersistenceService,
  ) {

  }

  timerId: string;

  async ngOnInit() {
    this.persistenceService.set(Constant.auths.tokenFirebase, environment.tokenFirebase, { type: StorageType.LOCAL });


    jQuery(document).on("wheel", "input[type=number]", function (e) {
      jQuery(this).blur();
    });

    this.eventListenerServiceInstance.getEventSubject.subscribe(x => {
      if (x) {
        // console.log("AppSecuredComponent: " + x);
      }
    });
  }

  ngOnDestroy() {
  }
}

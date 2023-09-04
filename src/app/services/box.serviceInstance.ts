import { Injectable } from '@angular/core';
import { Observable, Subject, ReplaySubject } from 'rxjs';

@Injectable()
export class BoxServiceInstance {

  eventSubject: Subject<any> = new ReplaySubject(1);

  constructor() { }

// set observable of this subject
  get getEventSubject(): Observable<any> {
    return this.eventSubject.asObservable();
  }
// remove from observer
  resetEventObserver(): void {
    this.eventSubject = new ReplaySubject(1);
  }
// send event to observers
  sendCustomEvent(data: any):void {
    this.eventSubject.next(data);
  }

}
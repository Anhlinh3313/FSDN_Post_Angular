import { Component, ElementRef, HostListener, Input } from '@angular/core';
import { EventListenerServiceInstance } from '../../services/eventListener.serviceInstance';

@Component({
  selector: "app-event-listener",
  template: ``
})
export class EventListenerComponent {
  public text: String;
  isWorking: boolean = true;
  interval: any;

  @HostListener("document:click", ["$event"])
  @HostListener("document:keydown", ["$event"])
  @HostListener("document:scroll", ["$event"])

  onListenEvent(event?: any): boolean {
    // let countSeconds = 0;
    // this.interval = setInterval(() => {
    //   countSeconds++;
    //   console.log(countSeconds);
    //   this.eventListenerServiceInstance.sendCustomEvent(countSeconds);
    // }, 1000);
    // console.log(++count);
    // console.log("lần 1: " + this.isWorking);
    // setTimeout(() => {
    //   // this.isWorking = false;
    //   ++countSeconds;
    //   console.log(countSeconds);
    //   // console.log("lần " + ++count + ": " + this.isWorking);
    // }, 1000);
    // if(this.eRef.nativeElement.contains(event.target)) {
    //   this.text = "clicked inside";
    //   console.log("clicked inside");
    // } else {
    //   this.text = "clicked outside";
    //   console.log("clicked inside");
    // }
    return this.isWorking;
  }

  constructor(
    private eRef: ElementRef,
    private eventListenerServiceInstance: EventListenerServiceInstance
  ) {
    // this.text = "no clicks yet";
  }
}
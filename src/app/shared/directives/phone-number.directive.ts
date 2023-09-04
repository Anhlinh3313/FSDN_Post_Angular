import { Directive, HostListener } from "@angular/core";

@Directive({
  selector: "[appPhoneNumber]"
})
export class PhoneNumberDirective {
  constructor() {}

  @HostListener("keypress", ["$event"])
  phoneNumber(e: KeyboardEvent) {
    if (
      (e.keyCode != 0 && e.keyCode != 8 && e.keyCode != 32 && e.keyCode != 46 &&  e.keyCode < 48) ||
      e.keyCode > 57
    ) {
      e.preventDefault();
    }
  }
}

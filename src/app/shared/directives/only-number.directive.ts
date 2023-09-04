import { Directive, HostListener } from "@angular/core";

@Directive({
  selector: "[appOnlyNumber]"
})
export class OnlyNumberDirective{  
  constructor() {}

  @HostListener("keypress", ["$event"])
  onlyNumber(e: KeyboardEvent) {
    if (
      (e.keyCode != 0 && e.keyCode != 8 &&  e.keyCode < 48 && e.keyCode != 46) ||
      e.keyCode > 57
    ) {
      e.preventDefault();
    }
  }

  // 0 => null character
  // 8 => backspace
  // 46 => .
  // 48 => 0
  // 57 => 9
}

import { Directive, HostListener, ElementRef, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter } from "@angular/core";
import { CurrencyFormatPipe } from "../../pipes/currencyFormat.pipe";
declare var jQuery: any;

@Directive({ selector: "[currencyFormatter]", host: { "(input)": 'onInputChange($event)' } })
export class CurrencyFormatterDirective implements OnInit, OnChanges {

  private el: HTMLInputElement;

  constructor(
    private elementRef: ElementRef,
    private currencyPipe: CurrencyFormatPipe
  ) {
    this.el = this.elementRef.nativeElement;
  }

  ngOnInit() {
    this.el.value = this.currencyPipe.transform(this.currencyPipe.parse(this.el.value));
  }

  @Input() public input: any;
  @Output() change = new EventEmitter();

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      this.el.value = this.currencyPipe.transform(this.currencyPipe.parse(changes.input.currentValue));
    }, 0);
  }

  onInputChange(event) {
    this.change.emit(event);
  }

  @HostListener("keypress", ["$event"])
  onlyNumber(e: KeyboardEvent) {
    if (
      (e.keyCode != 0 && e.keyCode != 8 && e.keyCode < 48 && e.keyCode != 46) ||
      e.keyCode > 57
    ) {
      e.preventDefault();
    }
  }

  @HostListener("focus", ["$event.target.value"])
  onFocus(value) {
    this.el.value = this.currencyPipe.parse(value); // opossite of transform
  }

  @HostListener("blur", ["$event.target.value"])
  onBlur(value) {
    this.el.value = this.currencyPipe.transform(value);
  }
}
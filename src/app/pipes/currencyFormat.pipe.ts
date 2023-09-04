import { Pipe, PipeTransform } from "@angular/core";

const PADDING = "000000";

@Pipe({ name: "currencyFormat" })
export class CurrencyFormatPipe implements PipeTransform {

  private DECIMAL_SEPARATOR: string;
  private THOUSANDS_SEPARATOR: string;

  constructor() {
    // TODO comes from configuration settings
    this.DECIMAL_SEPARATOR = ".";
    this.THOUSANDS_SEPARATOR = ",";
  }

  transform(value: number | string, fractionSize: number = -1): string {
    let [integer, fraction = ""] = (value||"").toString()
      .split(this.DECIMAL_SEPARATOR);

    fraction = fractionSize > 0
      ? this.DECIMAL_SEPARATOR + (fraction + PADDING).substring(0, fractionSize)
      : parseInt(fraction, 10) > 0 && fractionSize == -1 ? this.DECIMAL_SEPARATOR + fraction : '';

    integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, this.THOUSANDS_SEPARATOR);
    if (integer + fraction) return integer + fraction;
    else return '0';
  }

  parse(value: string, fractionSize: number = -1): string {
    let [integer, fraction = ""] = (value||"").toString().split(this.DECIMAL_SEPARATOR);

    integer = integer.replace(new RegExp(this.THOUSANDS_SEPARATOR, "g"), "");
    let a = parseInt(fraction, 0);
    fraction = parseInt(fraction, 10) > 0 && fractionSize > 0
      ? this.DECIMAL_SEPARATOR + (fraction + PADDING).substring(0, fractionSize)
      : parseInt(fraction, 10) > 0 && fractionSize == -1 ? this.DECIMAL_SEPARATOR + fraction : '';

    return integer + fraction;
  }

}
import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { HotkeysService, Hotkey } from "angular2-hotkeys";
import { Subject } from "rxjs/Subject";
import { Observable } from "rxjs/Observable";
import { Command } from "../models/abstract/command.interface";

interface HotkeyConfig {
  [key: string]: string[];
}

interface ConfigModel {
  hotkeys: HotkeyConfig;
}

@Injectable()
export class CommandService {
  private subject: Subject<Command>;
  commands: Observable<Command>;

  constructor(private hotkeysService: HotkeysService, private http: Http) {
    this.subject = new Subject<Command>();
    this.commands = this.subject.asObservable();
    this.http
      .get("assets/command.config.json")
      .toPromise()
      .then(r => r.json() as ConfigModel)
      .then(c => {
        for (const key in c.hotkeys) {
          const commands = c.hotkeys[key];
          hotkeysService.add(
            new Hotkey(key, (ev, combo) => {
              ev.returnValue = false;
              ev.preventDefault();
              return this.hotkey(ev, combo, commands);
            }, ['INPUT', 'SELECT', 'TEXTAREA'])
          );
        }
      });
  }

  hotkey(ev: KeyboardEvent, combo: string, commands: string[], allowIn?: string[]): boolean {
    allowIn = ['INPUT', 'SELECT', 'TEXTAREA'];
    commands.forEach(c => {
      const command = {
        name: c,
        ev: ev,
        combo: combo
      } as Command;
      this.subject.next(command);
    });
    return true;
  }
}

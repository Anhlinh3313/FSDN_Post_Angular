import { Constant } from "./constant";

export class SoundHelper {
    static SUCCESS = "/assets/audio/success.wav";
    static WARN = "/assets/audio/waring.wav";
    static ERROR = "/assets/audio/error.mp3";

    static getSoundMessage(type: string) {
        let src: string = "";
        switch (type) {
            case Constant.messageStatus.success:
                src = this.SUCCESS;
                break;
            case Constant.messageStatus.warn:
                src = this.WARN;
                break;
            case Constant.messageStatus.error:
                src = this.ERROR;
                break;
        }
        let audio = new Audio();
        audio.src = src;
        audio.load();
        audio.play();
    }
}
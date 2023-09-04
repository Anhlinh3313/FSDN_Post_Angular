export class TextToSpeechHelper {

    static readonly LANGUAGE = "Vietnamese Female";

    static TextToSpeech(text) {
        var url = "https://translate.google.com.vn/translate_tts?ie=UTF-8&q=ANYTHING_TEXT&tl=en&client=tw-ob"
        var audio = document.createElement("audio");
        audio.src = url;
        audio.play();
    }
}
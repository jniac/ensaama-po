
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

let recognition = new SpeechRecognition()
let speechRecognitionList = new SpeechGrammarList()
let grammar = `#JSGF V1.0; grammar colors; public <color> = girafe`
speechRecognitionList.addFromString(grammar, 1)

recognition.continuous = true
recognition.lang = 'fr-FR'
// recognition.lang = 'en-US'
recognition.interimResults = false
recognition.maxAlternatives = 1

recognition.start()

recognition.onresult = event => {

  console.log(event.results)

}

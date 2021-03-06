
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
//                                                                           //
//                            initialisation                                 //
//                                                                           //
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

// initialisation de la scène aux dimensions des images
main.init({

    width:      1280,
    height:     720,

})







// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
//                                                                           //
//                    déclaration des métrages (Footage)                     //
//                                                                           //
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

let footageIdle = new Footage({

    startURL:   'data/Idle/Cube-Idle0000.png',
    endURL:     'data/Idle/Cube-Idle0075.png',

})

let footageOpening = new Footage({

    startURL:   'data/Opening/Cube-Opening0000.png',
    endURL:     'data/Opening/Cube-Opening0075.png',
    visible:    false,
    paused:     true,
    loop:       false,

})



// lecture des métrages :

let playFootageOpening = () => {

    // important : lorsque une séquence se joue, il faut suspendre la détection des couleurs
    main.pauseSpeechRecognition()

    footageOpening.visible = true
    footageOpening.paused = false
    footageOpening.progress = 0

    footageOpening.once('complete', () => {

        playFootageIdle()

    })

}

let playFootageIdle = () => {

    // important : lorsque l'on revient sur la boucle d'attente, il faut reprendre la détection des couleurs
    main.resumeSpeechRecognition()

    footageOpening.visible = false
    footageOpening.paused = true

    // ici, éventuellement d'autres métrages à stopper
    //
    // footageWhatever.visible = false
    // footageWhatever.paused = false

}








// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
//                                                                           //
//                         logique de l'application                          //
//                                                                           //
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

main.initSpeechRecognition('chat', 'chien', 'dauphin')

main.words.on('chat', () => {

    playFootageOpening()

})

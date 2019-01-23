
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

// initialisation du color tracking
main.initColorTracking({

    red:        ({ hue, saturation, value }) => (hue <= 20 || hue >= 345) && saturation >= 0.75 && value >= 0.25,
    darkGreen:  ({ hue, saturation, value }) => hue >= 130 && hue <= 160 && saturation >= 0.5 && value >= 0.2 && value <= .5,

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







// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //
//                                                                           //
//                         logique de l'application                          //
//                                                                           //
// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

let playFootageOpening = () => {

    // important : lorsque une séquence se joue, il faut suspendre la détection des couleurs
    main.pauseColorTracking()

    footageOpening.visible = true
    footageOpening.paused = false
    footageOpening.progress = 0

    footageOpening.once('complete', () => {

        playFootageIdle()

    })

}

let playFootageIdle = () => {

    // important : lorsque l'on revient sur la boucle d'attente, il faut reprendre la détection des couleurs
    main.resumeColorTracking()

    footageOpening.visible = false
    footageOpening.paused = true

    // ici, éventuellement d'autres métrages à stopper
    //
    // footageWhatever.visible = false
    // footageWhatever.paused = false

}



// ici, l'application réagit aux évènements 'colors'

main.colors.on('red', () => {

    playFootageOpening()

})

main.colors.on('darkGreen', (event) => {

    console.log('ho, du darkGreen', event)

})

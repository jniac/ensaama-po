let vendorProxy = {

	get fullscreenElement() {

		return document.fullscreenElement || document.webkitFullscreenElement

	},

	get fullscreenChangeEvent() {

		return 'onfullscreenchange' in document ? 'fullscreenchange' :
			'onwebkitfullscreenchange' in document ? 'webkitfullscreenchange' :
			'fullscreenchange'

	},

}

let main = {

	mouse: {

		x: 0,
		y: 0,
		relativeX: 0,
		relativeY: 0,

	},

	init({ width, height }) {

        let WIDTH = width || 1280
        let HEIGHT = height || 720

		let ratio = WIDTH / HEIGHT

		let canvas = document.querySelector('#canvas')
		canvas.width = WIDTH
		canvas.height = HEIGHT

		canvas.addEventListener('mousemove', event => {

			main.mouse.x = event.offsetX
			main.mouse.y = event.offsetY
			main.mouse.relativeX = event.offsetX / WIDTH
			main.mouse.relativeY = event.offsetY / HEIGHT

			// main.fire('mousemove', { mouse: main.mouse })

		})

		function resize() {

			let { innerWidth:w, innerHeight:h } = window
			h = w / ratio
			canvas.style.width = w + 'px'
			canvas.style.height = h + 'px'
			canvas.style.top = ((innerHeight - h) / 2) + 'px'

		}

		window.addEventListener('resize', resize)
		resize()

		document.addEventListener(vendorProxy.fullscreenChangeEvent, event => {

			setTimeout(() => {

				let scale = vendorProxy.fullscreenElement ? innerWidth / WIDTH : 1
				let stage = document.querySelector('#stage')
				stage.style.transform = `scale(${scale.toFixed(4)})`

			}, 1000);

		})

		document.addEventListener('keydown', event => {

			if (event.key === 'f')
				main.toggleFullscreen()

		})

		let ctx = canvas.getContext('2d')

		Object.assign(main, { canvas, ctx })

		main.updateArray = []

		main.time = 0

		let anim = () => {

			requestAnimationFrame(anim)

			ctx.setTransform(1, 0, 0, 1, 0, 0)
			ctx.clearRect(0, 0, WIDTH, HEIGHT)

			Footage.drawAll(ctx)

			let tmp = main.updateArray
			main.updateArray = []
			main.updateArray = tmp.filter(listener => listener.callback() !== false).concat(main.updateArray)

			main.fire('update')

			main.time += 1 / 60

		}

		anim()

	},

	onUpdate(callback) {

		main.updateArray.push({ callback })

	},

	toggleFullscreen() {

		if (vendorProxy.fullscreenElement) {

			document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen()

		} else {

			let stage = document.querySelector('#stage') || document.querySelector('.stage')
			stage.requestFullscreen ? stage.requestFullscreen() : stage.webkitRequestFullscreen()

		}

	},

    pauseColorTracking() {

        main.colorTrackingPaused = true

    },

    resumeColorTracking() {

        main.colorTrackingPaused = false

    },

    initColorTracking(colors) {

        events.makeDispatcher(colors)

        let canvas = document.querySelector('canvas#tracker')
        let ctx = canvas.getContext('2d')

        for (let [colorName, colorTest] of Object.entries(colors)) {

            tracking.ColorTracker.registerColor(colorName, (r, g, b) => {

                let [hue, saturation, value] = rgbToHsv(r, g, b)

                hue *= 360

                return colorTest({ r, g, b, hue, saturation, value })

            })

        }

        let tracker = new tracking.ColorTracker(Object.keys(colors))

        tracking.track('#webcam', tracker, { camera: true, fps:2 })

        tracker.on('track', event => {

            ctx.clearRect(0, 0, canvas.width, canvas.height)

            if (main.colorTrackingPaused)
                return

            for (let rect of event.data) {

                ctx.strokeStyle = rect.color
                ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
                ctx.font = '11px Helvetica'
                ctx.fillStyle = "#fff"
                ctx.fillText(rect.color, rect.x + rect.width + 5, rect.y + 11)
                ctx.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 22)
                ctx.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 33)

                tracker.emit(rect.color)

                main.colors.fire(rect.color, { rect })

            }

        })

        Object.assign(main, {

            colors,
            tracker,

        })

    },

}

// eventjs.implementEventDispatcher(main)
events.makeDispatcher(main)










// > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > //
//                                                                                     //
//                                    VIDEO                                            //
//                                                                                     //
// > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > //

function getWebcamTracker(colors) {

	let canvas = document.querySelector('canvas#tracker')
	let ctx = canvas.getContext('2d')

	let tracker = new tracking.ColorTracker(colors)

	task = tracking.track('#webcam', tracker, { camera: true })

	tracker.on('track', event => {

		ctx.clearRect(0, 0, canvas.width, canvas.height)

		for (let rect of event.data) {

			ctx.strokeStyle = rect.color
			ctx.strokeRect(rect.x, rect.y, rect.width, rect.height)
			ctx.font = '11px Helvetica'
			ctx.fillStyle = "#fff"
			ctx.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11)
			ctx.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22)

			tracker.emit(rect.color)

		}

	})

	return tracker

}
















// > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > //
//                                                                                     //
//                                    AUDIO                                            //
//                                                                                     //
// > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > //

function getAudioTracker(thresholds) {

	let input = new p5.AudioIn()
	input.start()

	let analyzer = new p5.Amplitude()
	analyzer.setInput(input)

	let index = -1

	let tracker = new eventjs.EventDispatcher()

	main.onUpdate(() => {

		let level = analyzer.getLevel()

		// console.log(level)

		let newIndex = 0

		while(thresholds[newIndex] < level)
			newIndex++

		if (index !== newIndex) {

			index = newIndex

			tracker.dispatchEvent('change level-' + index, { index, level })

		}


	})

 	return tracker

}

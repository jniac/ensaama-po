let main = {

	mouse: { 

		x: 0, 
		y: 0, 
		relativeX: 0, 
		relativeY: 0,

	},

	init(WIDTH = 1280, HEIGHT = 720) {

		let canvas = document.querySelector('canvas.main')
		canvas.width = WIDTH
		canvas.height = HEIGHT

		canvas.addEventListener('mousemove', event => {

			this.mouse.x = event.offsetX
			this.mouse.y = event.offsetY
			this.mouse.relativeX = event.offsetX / WIDTH
			this.mouse.relativeY = event.offsetY / HEIGHT

			this.dispatchEvent('mousemove', { mouse: this.mouse })

		})

		document.addEventListener('fullscreenchange', event => {

			setTimeout(() => {

				let scale = document.fullscreenElement ? innerWidth / WIDTH : 1
				let stage = document.querySelector('#stage')
				stage.style.transform = `scale(${scale.toFixed(4)})`
				
			}, 1000);
	
		})

		document.addEventListener('keydown', event => {

			if (event.key === 'f')
				this.enterFullscreen()

		})

		let ctx = canvas.getContext('2d')

		Object.assign(this, { canvas, ctx })

		this.updateArray = []

		this.time = 0

		let anim = () => {

			requestAnimationFrame(anim)

			ctx.setTransform(1, 0, 0, 1, 0, 0)
			ctx.clearRect(0, 0, WIDTH, HEIGHT)

			Footage.drawAll(ctx)

			let tmp = this.updateArray
			this.updateArray = []
			this.updateArray = tmp.filter(listener => listener.callback() !== false).concat(this.updateArray)

			this.dispatchEvent('update')

			this.time += 1 / 60

		}

		anim()

	},

	onUpdate(callback) {

		this.updateArray.push({ callback })

	},

	enterFullscreen() {

		let stage = document.querySelector('#stage') || document.querySelector('.stage')
		stage.requestFullscreen()

	},

}

eventjs.implementEventDispatcher(main)










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








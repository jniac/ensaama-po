(function() {

	let footages = []

	let globalTimeScale = 1

	let FootageDefaultOptions = { 

		fps: 24, 
		zIndex: 0,
		autoPlay: true,
		loop: true,
		visible: true,

	}

	class Footage extends eventjs.EventDispatcher {

		constructor(startURL, endURL, options) {

			super()

			Object.assign(this, FootageDefaultOptions, options)

			this.id = footages.length
			footages.push(this)

			let [,base] = startURL.match(/(.*?)\d{3,4}\.\w+/)
			let [ext] = startURL.match(/\.\w+/)
			let indexLength = startURL.match(/\d{3,4}/)[0].length

			let [,startIndex] = (startURL.match(/(\d{3,4})\.\w+$/) || []).map(parseFloat)
			let [,endIndex] = (endURL.match(/(\d{3,4})\.\w+$/) || []).map(parseFloat)

			this.base = base
			this.ext = ext
			this.indexLength = indexLength
			this.startIndex = startIndex
			this.endIndex = endIndex
			this.numOfFrames = endIndex - startIndex

			this.currentIndex = 0
			this.time = 0
			this.timeScale = 1
			this.timeMax = this.numOfFrames / this.fps

			this.images = []

			this.paused = !this.autoPlay
			
			var that = this

			let loadCount = 0

			for (let i = startIndex; i <= endIndex; i++) {

				let image = new Image()
				let src = base + i.toFixed().padStart(indexLength, '0') + ext

				// chargement des images
				image.src = src

				image.onload = event => {

					loadCount++

					if (loadCount == this.numOfFrames)
						console.log(`${base} has load (${this.numOfFrames} frames)`)

				}

				this.images.push(image)

			}

		}

		update(dt = 1 / 60) {

			if (this.paused)
				return

			this.time += dt * this.timeScale

			if (this.time > this.timeMax) {

				if (this.loop) {

					this.time = 0

					this.dispatchEvent('loop')

				} else {

					this.time = this.timeMax

					this.dispatchEvent('complete')

				}

			}

			if (this.time < 0) {

				if (this.loop) {

					this.time += this.timeMax

					this.dispatchEvent('loop')

				} else {

					this.time = 0

					this.dispatchEvent('complete')

				}

			}

			if (this.time < this.timeMax) {

				this.currentIndex = this.startIndex + Math.floor(this.numOfFrames * this.time / this.timeMax)

			} else {

				this.currentIndex = this.numOfFrames - 1

			}

		}

		next() {

			this.currentIndex++

			if (this.currentIndex < this.startIndex)
				this.currentIndex = this.endIndex

			if (this.currentIndex > this.endIndex)
				this.currentIndex = this.startIndex

		}

		get currentImage() { 

			return this.images[this.currentIndex - this.startIndex]

		}

		draw(ctx, offsetX = 0, offsetY = 0) {

			if (this.currentImage)
				ctx.drawImage(this.currentImage, offsetX, offsetY)

		}

		play() {

			this.paused = false

		}

		pause() {

			this.paused = true

		}



		static drawAll(ctx) {

			for (let footage of footages.sort((A, B) => A.zIndex - B.zIndex))
				if (footage.visible)
					footage.draw(ctx)

		}

		static get globalTimeScale() { return globalTimeScale }
		static set globalTimeScale(value) { globalTimeScale = value }

	}

	function anim() {

		requestAnimationFrame(anim)

		for (let footage of footages)
			footage.update(1 / 60 * globalTimeScale)

	}

	anim()

	Object.assign(window, {

		Footage,

	})

})()









(function() {

	// > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > //
	//                                                                                         //
	//                                       footage.js                                        //
	//                                                                                         //
	// > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > //

	/**
	 * 
	 * v 2
	 * • images are drawn to canvas (better performance (draw, caching))
	 * 
	 * v 1
	 * • timeScale, opacity
	 * • images are loaded asynchronously, maxImagesLoading is the number of simultaneous loading images
	 * • x, y, scale, scaleX, scaleY, rotation
	 * 
	 */

	// > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > //
	//                                                                                         //
	//                            Gestion du chargement des images                             //
	//                                                                                         //
	// > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > //

	let imagesToLoad = []
	let numImagesLoading = 0
	let maxImagesLoading = 20

	function getBundle(url) {

		let image = new Image()
		let canvas = document.createElement('canvas')
		let bundle = { image, url, canvas }

		imagesToLoad.push(bundle)

		loadNextImages()

		return bundle

	}

	function loadNextImages() {

		while(imagesToLoad.length && numImagesLoading < maxImagesLoading) {

			let { image, url, canvas } = imagesToLoad.shift()

			image.src = url

			image.addEventListener('load', (image, url, canvas, event => {

				canvas.width = image.naturalWidth
				canvas.height = image.naturalHeight
				canvas.getContext('2d').drawImage(image, 0, 0)

				image.src = ''

				numImagesLoading--

				loadNextImages()

			}).bind(null, image, url, canvas))

			numImagesLoading++

		}

	}








	// > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > //
	//                                                                                         //
	//                                       Footage                                           //
	//                                                                                         //
	// > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > //


	let footages = []

	let globalTimeScale = 1

	let FootageDefaultOptions = { 

		fps: 24, 

		enabled: true,
		loop: true,
		visible: true,
		paused: false,


		x: '50%',
		y: '50%',
		width: 0,
		height: 0,
		rotation: 0,
		scale: 1,
		scaleX: 1,
		scaleY: 1,

		anchorX: 0.5,
		anchorY: 0.5,

		blendMode: 'source-over',
		opacity: 1,
		zIndex: 0,

		showEdges: false,

	}

	function processNumericalValue(x, relativeSpace) {

		switch(typeof x) {

			case 'number':
				return x

			case 'string':
				return x.slice(-1) === '%' ? parseFloat(x) / 100 * relativeSpace : 0

			default:
				return 0

		}

	}

	console.log(processNumericalValue('10%'))

	class Footage extends eventjs.EventDispatcher {

		constructor(startURL, endURL, options) {

			super()

			Object.assign(this, FootageDefaultOptions, options)

			this.id = footages.length
			footages.push(this)

			this.currentIndex = 0
			this.time = 0
			this.timeScale = 1
			this.timeMax = 0

			this.images = []
			
			// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

			// n frame footage			
			if (startURL && endURL) {

				try {

					let [,base] = startURL.match(/(.*?)\d{3,6}\.\w+/)
					let [ext] = startURL.match(/\.\w+/)
					let indexLength = startURL.match(/\d{3,6}/)[0].length

					let [,startIndex] = (startURL.match(/(\d{3,6})\.\w+$/) || []).map(parseFloat)
					let [,endIndex] = (endURL.match(/(\d{3,6})\.\w+$/) || []).map(parseFloat)

					this.base = base
					this.ext = ext
					this.indexLength = indexLength
					this.startIndex = startIndex
					this.endIndex = endIndex
					this.numOfFrames = endIndex - startIndex
					this.timeMax = this.numOfFrames / this.fps

				} catch (e) {

					console.error(`arguments invalides  !!!\n(startURL: ${startURL}, endURL: ${endURL}) \nle footage est désactivé`)

					this.enabled = false

				}

				let loadCount = 0

				for (let i = this.startIndex; i <= this.endIndex; i++) {

					let src = this.base + i.toFixed().padStart(this.indexLength, '0') + this.ext
					let bundle = getBundle(src)

					if (i === this.startIndex) {

						bundle.image.addEventListener('load', event => {

							this.width = event.target.naturalWidth
							this.height = event.target.naturalHeight

						})

					}

					bundle.image.addEventListener('load', event => {

						loadCount++

						if (loadCount == this.numOfFrames) {
							
							console.log(`${this.base} has been loaded (${this.width}x${this.height}px ${this.numOfFrames} frames)`)
							this.dispatchEvent('load')

						}

					})

					this.images.push(bundle.canvas)

				}
				
			}

			// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - //

			// one frame footage
			if (startURL && !endURL) {

				this.numOfFrames = 1
				this.currentIndex = 0
				this.startIndex = 0
				this.endIndex = 0

				let bundle = getBundle(startURL)

				bundle.image.addEventListener('load', event => {

					this.width = bundle.image.naturalWidth
					this.height = bundle.image.naturalHeight

					console.log(`${startURL} has been loaded (${this.width}x${this.height}px one single frame)`)
					this.dispatchEvent('load')

				})

				this.images.push(bundle.canvas)				

			}

		}

		update(dt = 1 / 60) {

			this.dispatchEvent('update')

			this.time += dt * this.timeScale * (this.paused ? 0 : 1)

			if (this.time >= this.timeMax) {

				if (this.loop) {

					this.time = 0

					this.dispatchEvent('loop')

				} else {

					this.time = this.timeMax

					if (this.timeOld < this.timeMax)
						this.dispatchEvent('complete')

				}

			}

			if (this.time < 0) {

				if (this.loop) {

					this.time += this.timeMax

					this.dispatchEvent('loop')

				} else {

					this.time = 0

					if (this.timeOld > 0)
						this.dispatchEvent('complete')

				}

			}

			if (this.time < this.timeMax) {

				this.currentIndex = this.startIndex + Math.floor(this.numOfFrames * this.time / this.timeMax)

			} else {

				this.currentIndex = this.endIndex

			}

			if (this.time !== this.timeOld)
				this.dispatchEvent('change')

			this.timeOld = this.time

		}

		get progress() { return this.time / this.timeMax }
		set progress(value) { this.time = this.timeMax * (value < 0 ? 0 : value > 1 ? 1 : value) }

		get currentImage() { 

			return this.images[this.currentIndex - this.startIndex]

		}

		draw(ctx, offsetX = 0, offsetY = 0) {

			if (!this.currentImage)
				return


			ctx.globalAlpha = this.opacity
			ctx.setTransform(1, 0, 0, 1, 0, 0)

			let x = processNumericalValue(this.x, ctx.canvas.width)
			let y = processNumericalValue(this.y, ctx.canvas.height)

			ctx.translate(x, y)
			ctx.scale(this.scale * this.scaleX, this.scale * this.scaleY)
			ctx.rotate(this.rotation * Math.PI / 180)
			ctx.translate(-this.width * this.anchorX, -this.height * this.anchorY)

			ctx.globalCompositeOperation = this.blendMode

			ctx.drawImage(this.currentImage, offsetX, offsetY)

			if (this.showEdges) {

				ctx.beginPath()
				ctx.rect(0, 0, this.width, this.height)
				ctx.stroke()

			}

		}

		play() {

			this.paused = false

		}

		pause() {

			this.paused = true

		}



		static drawAll(ctx) {

			for (let footage of footages.sort((A, B) => A.zIndex - B.zIndex))
				if (footage.enabled && footage.visible)
					footage.draw(ctx)

		}

		static get globalTimeScale() { return globalTimeScale }
		static set globalTimeScale(value) { globalTimeScale = value }

	}

	function anim() {

		requestAnimationFrame(anim)

		for (let footage of footages)
			if (footage.enabled)
				footage.update(1 / 60 * globalTimeScale)

	}

	anim()

	Object.assign(window, {

		Footage,

	})

})()









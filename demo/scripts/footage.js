(function() {

	// > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > //
	//                                                                                         //
	//                            Gestion du chargement des images                             //
	//                                                                                         //
	// > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > //

	let imagesToLoad = []
	let numImagesLoading = 0
	let maxImagesLoading = 20

	function getImage(url) {

		let image = new Image()

		imagesToLoad.push({ image, url })

		loadNextImages()

		return image

	}

	function loadNextImages() {

		while(imagesToLoad.length && numImagesLoading < maxImagesLoading) {

			let { image, url } = imagesToLoad.shift()

			image.src = url

			image.addEventListener('load', event => {

				numImagesLoading--

				loadNextImages()

			})

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
		zIndex: 0,

		enabled: true,
		loop: true,
		visible: true,

		blendMode: 'source-over',

		x: 0,
		y: 0,
		width: 0,
		height: 0,
		rotation: 0,
		scale: 1,
		scaleX: 1,
		scaleY: 1,

		anchorX: 0.5,
		anchorY: 0.5,

		showEdges: false,

	}

	class Footage extends eventjs.EventDispatcher {

		constructor(startURL, endURL, options) {

			super()

			Object.assign(this, FootageDefaultOptions, options)

			this.id = footages.length
			footages.push(this)

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

			} catch (e) {

				console.error(`arguments invalides  !!!\n(startURL: ${startURL}, endURL: ${endURL}) \nle footage est désactivé`)

				this.enabled = false

			}

			this.currentIndex = 0
			this.time = 0
			this.timeScale = 1
			this.timeMax = this.numOfFrames / this.fps

			this.images = []
			
			let loadCount = 0

			for (let i = this.startIndex; i <= this.endIndex; i++) {

				let src = this.base + i.toFixed().padStart(this.indexLength, '0') + this.ext
				let image = getImage(src)

				if (i === this.startIndex) {

					image.addEventListener('load', event => {

						this.width = event.target.naturalWidth
						this.height = event.target.naturalHeight

					})

				}

				image.addEventListener('load', event => {

					loadCount++

					if (loadCount == this.numOfFrames) {
						
						console.log(`${this.base} has load (${this.width}x${this.height}px ${this.numOfFrames} frames)`)
						this.dispatchEvent('load')

					}

				})

				this.images.push(image)

			}

		}

		update(dt = 1 / 60) {

			this.timeOld = this.time
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

				this.currentIndex = this.numOfFrames - 1

			}

		}

		get progress() { return this.time / this.timeMax }
		set progress(value) { this.time = this.timeMax * value }

		get currentImage() { 

			return this.images[this.currentIndex - this.startIndex]

		}

		draw(ctx, offsetX = 0, offsetY = 0) {

			if (!this.currentImage || !this.currentImage.complete)
				return

			ctx.setTransform(1, 0, 0, 1, 0, 0)

			ctx.translate(this.x, this.y)
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
			footage.update(1 / 60 * globalTimeScale)

	}

	anim()

	Object.assign(window, {

		Footage,

	})

})()









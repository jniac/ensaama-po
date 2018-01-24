
const WIDTH = 1280
const HEIGHT = 720

let canvas = document.querySelector('canvas.main')
let ctx = canvas.getContext('2d')

function anim() {

	requestAnimationFrame(anim)

	ctx.clearRect(0, 0, WIDTH, HEIGHT)

	Footage.drawAll(ctx)

}

anim()













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

			tracker.emit(rect.color, { data: event.data })

		}

	})

	return tracker

}




// // let video1 = document.getElementById('video1')
// let canvas1 = document.getElementById('canvas1')
// let context1 = canvas1.getContext('2d')

// // syntaxe : tracking.ColorTracker(option_colors)
// // exp : (['magenta', 'cyan', 'yellow']) / default () : 'magenta'
// // let tracker1 = new tracking.ColorTracker(['yellow','cyan'])  

// trackerTask1 = tracking.track('#webcam1', tracker1, { camera: true })
// console.log("Tracker1 running ...")

// tracker1.on('track', function(event) {

//     context1.clearRect(0, 0, canvas1.width, canvas1.height)

//     event.data.forEach(function(rect) {
// 		setTimeout(function () {
// 			trackersStop()
// 		}, 0)
		
// 		if (rect.color === 'custom') {
// 			rect.color = tracker1.customColor
// 		}
// 		console.log("Tracker1 find : "+rect.color)
		
// 		// reperes detection
// 		context1.strokeStyle = rect.color
// 		context1.strokeRect(rect.x, rect.y, rect.width, rect.height)
// 		context1.font = '11px Helvetica'
// 		context1.fillStyle = "#fff"
// 		context1.fillText('x: ' + rect.x + 'px', rect.x + rect.width + 5, rect.y + 11)
// 		context1.fillText('y: ' + rect.y + 'px', rect.x + rect.width + 5, rect.y + 22)			
					
// 		playVid(rect.color,function () {
// 			trackersReStart()
// 		})

//     })
// }) 












// > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > //
//                                                                                     //
//                                    AUDIO                                            //
//                                                                                     //
// > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > > //

let input = new p5.AudioIn()








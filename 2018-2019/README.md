# note

penser à dézipper `data.zip`

# footage.js
### features!

events, transforms, blend modes, timeScale

### basic usage:

```javascript
let footage = new Footage({

    startURL:   'a-folder/an-image-with-index-XXXX.png',
	endURL:     'a-folder/an-image-with-index-XXXX.png',

    ...options

})

// where options are (default) :

{

	fps: 24,

	enabled: true,
	loop: true,
	visible: true,
	paused: false,

	blendMode: 'source-over',

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

	opacity: 1,
	zIndex: 0,

	showEdges: false,

}
```

_with_ & _height_ are set from actual image size (from the first image)

### events:

footage dispatch events (thanks to event.js)  
load, loop, complete, update

```javascript

footage.on('load', event => {

	// all images are loaded

})

footage.on('loop', event => {

	// footage.time has reached footage.timeMax (or 0, if footage.timeScale < 0)

})

footage.on('complete', event => {

	// footage.loop = false
	// so the event "loop" will not be fired
	// watch "complete" instead

})

footage.on('change', event => {

	// footage.time has changed !
	// so 'change' is not triggered when footage.paused === true (or when footage.timeScale === 0, or when the footage is complete etc.)

})

footage.on('update', event => {

	// the footage has been updated (60 times per second, since footage.enabled === true)

})

```

### useful properties:

x, y, scale, opacity, progress (get/set) etc...

```javascript

footage.on('update', event => {

	footage.scale = 1 + footage.progress

	// amazing animation!
	// when footage.time = 0 : footage.progress === 0
	// when footage.time = footage.timeMax : footage.progress === 1

})

// or

window.addEventListener('mousemove', event => {

	footage.progress = event.pageX / window.innerWidth

})

```

enjoy!

### links

blend modes in canvas:  
[MDN docs, CanvasRenderingContext2D.globalCompositeOperation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation)

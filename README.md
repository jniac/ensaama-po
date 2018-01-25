# Test rapide

télécharger le projet au format zip  
déziper le projet  
déziper data.zip (à l'intérieur du dossier /demo)  
lancer la page index.html (pas besoin de serveur local)  

# footage.js
### features!

events, transforms, blend modes, timeScale

### basic usage:

```javascript
let footage = new Footage(
	'a-folder/an-image-with-index-XXXX.png', // start url
	'a-folder/an-image-with-index-XXXX.png', // end url
	{ ...options })

// where options are (default) :

{

	fps: 24, 
	zIndex: 0,

	enabled: true,
	loop: true,
	visible: true,
	paused: false,

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

	// footage.time reach footage.timeMax (or 0, if footage.timeScale < 0)

})

footage.on('complete', event => {

	// footage.loop = false
	// so the event "loop" will not be fired
	// watch "complete" instead

})

footage.on('update', event => {

	// footage.time has changed !
	// so update is not triggered when footage.paused === true

})

```

### useful properties: 

x, y, scale, progress etc...

```javascript

footage.on('update', event => {

	footage.scale = 1 + footage.progress

	// amazing animation!
	// when footage.time = 0 : footage.progress === 0
	// when footage.time = footage.timeMax : footage.progress === 1

})

```

enjoy!

### links

blend modes in canvas:  
[MDN docs, CanvasRenderingContext2D.globalCompositeOperation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation)
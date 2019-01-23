
// https://en.wikipedia.org/wiki/HSL_and_HSV

function rgbToHsv(r, g, b) {

	r /= 0xff
    g /= 0xff
    b /= 0xff

	var max = Math.max(r, g, b), min = Math.min(r, g, b)
	var h, s, v = max

	var d = max - min

	s = max == 0 ? 0 : d / max

	if (max == min) {

		h = 0 // achromatic

	} else {

		switch (max) {

			case r: h = (g - b) / d + (g < b ? 6 : 0); break
			case g: h = (b - r) / d + 2; break
			case b: h = (r - g) / d + 4; break

		}

		h /= 6

	}

	return [h, s, v]

}

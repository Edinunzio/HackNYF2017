const CLARIFAI_KEY = /* your clarifai api key here */;
const GIPHY_KEY = /* your giphy api key here */;
var celeb = "";
var gif = "";
var imageSrcs = [];
var images = [];
var fits = [];

window.onload = function () {

	var s = document.createElement('script');
	s.src = "https://sdk.clarifai.com/js/clarifai-latest.js";
	s.type = "text/javascript";

	document.head.appendChild(s);
	
	chrome.storage.sync.get(['celebrity', 'gif'], function(items) {
		// replace all images of that celebrity with gif
		// make calls to Clarifai API and GIPHY API
		console.log(items['celebrity'], items['gif']);
		celeb = items['celebrity'];
		gif = items['gif'];

		images = document.getElementsByTagName('img');
		console.log("images", images);
		for (var j = 0; j < images.length; j++) {
			// send image to Clarifai api
			var imageSrc = images[j].src;
			// png, jpeg, jpg, bitmap
			if (imageSrc.includes(".png") || imageSrc.includes(".jpeg") || imageSrc.includes(".jpg")) {
				console.log(imageSrc);
				imageSrcs.push({"data": {"image": {"url": imageSrc}}});
			} else {
				continue;
			}
		}
		var req = new XMLHttpRequest();
		req.addEventListener("load", reqCallback);
		req.open("POST", "https://api.clarifai.com/v2/models/e466caa0619f444ab97497640cefc4dc/outputs");
		req.setRequestHeader("Content-Type", "application/json");
		req.setRequestHeader("Authorization", "Key " + CLARIFAI_KEY);
		ourData = JSON.stringify({ "inputs": imageSrcs });
		console.log(ourData);
		req.send(ourData);
	});

	function reqCallback() {
		var data = JSON.parse(this.responseText);
		console.log(data);
		if (data.status.code === 10000) {
			if (data.outputs) {
				for (var k = 0; k < data.outputs.length; k++) {
					var fit = data.outputs[k].data.regions ? data.outputs[k].data.regions[0].data.face.identity.concepts[0].name : null;
					console.log(fit, celeb);
					if (fit && fit.toLowerCase().includes(celeb.toLowerCase())) {
						// The matching celebrity is the same as user's selected celebrity
						fits.push(data.outputs[k].input.data.image.url);
						var greq = new XMLHttpRequest();
						greq.addEventListener("load", gReqCallback);
						var params = "api_key=" + GIPHY_KEY +"&q="+ gif+"&limit="+ 1;
						greq.open("GET", "https://api.giphy.com/v1/gifs/search?" + params);
						greq.setRequestHeader("Content-Type", "application/json");
						gOurData = JSON.stringify({"api_key": GIPHY_KEY, "q": gif, "limit": 1});
						greq.send(params);
					}
				}
			}
		}
	}

	function gReqCallback() {
		console.log(this.responseText);
		var data = JSON.parse(this.responseText);
		console.log(data);
		for (var l = 0; l < imageSrcs.length; l++) {
			for (var m = 0; m < fits.length; m++) {
				console.log(imageSrcs[l].data.image.url, fits[m]);
				if (imageSrcs[l].data.image.url == fits[m]) {
					console.log(data.data[0]);
					var src = data.data[0].url.split("-");
					console.log(src);
					src = src[src.length - 1];
					var final = "https://media.giphy.com/media/" + src + "/giphy.gif";
					images[l].src = final; /*url given by giphy*/
					console.log(images[l]);
				}
			}
		}
	}

	chrome.storage.onChanged.addListener(function(changes, namespace) {
        for (key in changes) {
          var storageChange = changes[key];
          console.log('Storage key "%s" in namespace "%s" changed. ' +
                      'Old value was "%s", new value is "%s".',
                      key,
                      namespace,
                      storageChange.oldValue,
                      storageChange.newValue);
        }
      });
	
}
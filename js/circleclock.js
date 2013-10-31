// scoreboard downward growing prototype using svg.js

// by Evan Raskob for gameshowhack
// https://twitter.com/evanraskob


//
// Global vars
//

// create svg drawing paper
var svg;

var minutesBlobs, secondsBlobs, hoursBlobs, blobs;
var clockRadius; // radius of the whole clock (half the diameter)
var blobRadius;
var previousDate, currentDate;	// for getting the current time and storing it
var turns = 8; // for spiral
var max_minutes = 59; // max count of minutes in an hour
var max_seconds = 59; // max count of seconds in a minute
var max_millis = 999;
var timeScale = 120; // this is the number of blobs in the spiral of seconds, minutes, hours, etc.
var speed = 2;  // how fast it ticks. 1 is realtime


//
// init everything
//
function initCanvas()
{
	// create svg drawing paper
	svg = SVG('canvas');
	
	currentDate = new Date();
	
	minutesBlobs = [];
 	secondsBlobs = [];
	hoursBlobs = [];
	blobs = [];

	var vb = svg.viewbox();
    var centerX = (vb.width / 2);
    var centerY = (vb.height / 2);

	clockRadius = vb.width * 0.8; // leave some padding
	blobRadius = clockRadius/20;    
	
	//var clockFace = svg.circle( clockRadius ).attr('class', 'clock-face')
	//	.center(centerX, centerY);

	var blobsGroup = svg.group().attr('class', 'blobs'); // markers for secs & mins
	var minutes = svg.group().attr('class', 'minutes');
	var seconds = svg.group().attr('class', 'seconds');
	
	//seconds.transform({x:centerX, y:centerY});  // doesn't work...
	//	var hours = svg.group().attr('class', 'hours');

	// set current time
	currentDate = new Date();
	
	var calcSeconds =  currentDate.getSeconds() + currentDate.getMilliseconds()/max_millis;
    var calcMinutes =  currentDate.getMinutes() + calcSeconds/(max_seconds+1);
	var calcSecondsScaled = parseInt((calcSeconds/(max_seconds+1) * speed * timeScale) % timeScale, 10);
	var calcMinutesScaled = parseInt((calcMinutes/(max_minutes+1) * speed * timeScale) % timeScale, 10);
	
	
	while (blobs.length < timeScale)
	{
		var blob = blobsGroup.circle(0);
	
		//spiral

		var	spiralCoords = spiral (blobs.length/timeScale, clockRadius/2-blobRadius, turns);
			blob.center(
				centerX,
				centerY
			);
	
		blob.animate(500/speed, SVG.easing.quad)
			.size(blobRadius*2,blobRadius*2)
			.center(
			centerX+spiralCoords.x, 
			centerY+spiralCoords.y
		);
	
		// keep reference to this element for later
		blobs.push(  blob );
	}
	
	while (minutesBlobs.length <= calcMinutesScaled)
	{
		nextMinute(minutesBlobs.length);
	}

	
	while (secondsBlobs.length <= calcSecondsScaled)
	{
		nextSecond(secondsBlobs.length);
	}
	
	
	
	updateTime();
	
	setInterval(updateTime, 10);
}


//
// handle next second
//
function nextSecond(time) {

	//console.log(time);
	
	if (time == 0)
	{
		$("#canvas").toggleClass('end-rotate');
		//console.log("toggle rotate");
		// OLD - now removes seconds when it rotates back
		//
		// remove old seconds
// 		while (secondsBlobs.length > 0)
// 		{
// 			var blob = secondsBlobs.pop();
// 			blob.remove();
// 		}
		
	}
	
	var vb = svg.viewbox();
    var centerX = (vb.width / 2);
    var centerY = (vb.height / 2);

	var animationTime = 1000/speed;
	
	var secondsGroup = $('.seconds');
	if (secondsGroup != null) secondsGroup = secondsGroup[0].instance;

	// are we removing old or adding new elements?
	// if the canvas element has the 'end-rotate' class, it means we're rotating backwards
	// and thus removing elements 
	var adding = $("#canvas").hasClass('end-rotate');

	// if we're removing ('adding' is false)
	if (false === adding)
	{
		// remove last element
		var secondsBlob = secondsBlobs.pop();

		var prevSpiralCoords = {x: 0, y: 0};

		// last position
		prevSpiralCoords = spiral (1-(time+1)/timeScale, clockRadius/2-blobRadius, turns);
		
		// animate it into position, then remove it afterwards
		secondsBlob.animate(animationTime, '<')
			.center(
				centerX+prevSpiralCoords.x, 
				centerY+prevSpiralCoords.y
			)
			.opacity(0)
			.size(0,0)
			.after(function() { this.remove(); });
	}
	
	// otherwise, we're adding new ones:
	else 
	{	
		var secondsBlob = secondsGroup.circle(0);
		secondsBlob.opacity(0);		
		// linear
		//secondsBlob.center(seconds*blobRadius, centerY);

	
		//spiral

		// last position
		if (time > 0)
		{
			prevSpiralCoords = spiral ((time-1)/timeScale, clockRadius/2-blobRadius, turns);
			secondsBlob.center(
				centerX+prevSpiralCoords.x, 
				centerY+prevSpiralCoords.y
			);
		}
		else
		{
			secondsBlob.center(centerX,centerY);
		}
	
		// current position
		var spiralCoords = spiral (time/timeScale, clockRadius/2-blobRadius, turns);
	

		secondsBlob.animate(animationTime, SVG.easing.quad)
			.size(blobRadius,blobRadius)
			.opacity(1)
			.center(
			centerX+spiralCoords.x, 
			centerY+spiralCoords.y
		);
	
		// keep reference to this element for later
		secondsBlobs.push(  secondsBlob );
	}
	
	//secondsBlob.attr('class', 'seconds end-seconds');

}





//
// handle next minute
//
function nextMinute(time) {

	// if we're at max_minutes minutes and there's something in the array,
	// we're removing minutes
	if (time == 0 && (minutesBlobs.length > 0))
	{
		$("#canvas").toggleClass('removing-minutes');

		// OLD - now removes seconds when it rotates back
		//
		// remove old minutes
// 		while (minutesBlobs.length > 0)
// 		{
// 			var blob = minutesBlobs.pop();
// 			blob.remove();
// 		}	
	}
	
	var vb = svg.viewbox();
    var centerX = (vb.width / 2);
    var centerY = (vb.height / 2);
	
	var animationTime = 60000/speed;

	var minutesGroup = $('.minutes');
	if (minutesGroup != null) minutesGroup = minutesGroup[0].instance;

	// are we removing old or adding new elements?
	// if the canvas element has the 'end-rotate' class, it means we're rotating backwards
	// and thus removing elements 
	var removing = $("#canvas").hasClass('removing-minutes');

	// if we're removing ('adding' is false)
	if (true === removing)
	{
		// remove last element
		var minutesBlob = minutesBlobs.pop();

		var prevSpiralCoords = {x: 0, y: 0};

		// last position
		prevSpiralCoords = spiral (1-(time+1)/timeScale, clockRadius/2-blobRadius, turns);
		
		// animate it into position, then remove it afterwards
		minutesBlob.animate(animationTime, '<')
			.center(
				centerX+prevSpiralCoords.x, 
				centerY+prevSpiralCoords.y
			)
			.opacity(0)
			.size(0,0)
			.after(function() { this.remove(); });
	}
	
	// otherwise, we're adding new ones:
	else 
	{	
		var minutesBlob = minutesGroup.circle(0);
		minutesBlob.opacity(0);
		// linear
		//minutesBlob.center(minutes*blobRadius, centerY);

	
		//spiral

		// last position
		if (time > 0)
		{
			var prevSpiralCoords = spiral ((time-1)/timeScale, clockRadius/2-blobRadius, turns);
			minutesBlob.center(
				centerX+prevSpiralCoords.x, 
				centerY+prevSpiralCoords.y
			);
		}
		else
		{
			minutesBlob.center(centerX,centerY);
		}
	
		// current position
		var spiralCoords = spiral (time/timeScale, clockRadius/2-blobRadius, turns);
	

		minutesBlob.animate(animationTime, SVG.easing.quad)
			.size(blobRadius*1.5,blobRadius*1.5)
			.opacity(1)
			.center(
			centerX+spiralCoords.x, 
			centerY+spiralCoords.y
		);
	
		// keep reference to this element for later
		minutesBlobs.push(  minutesBlob );
	}
}



//
// return x,y coords of a spiral given an index (0-1) max radius for the spiral
// and the number of turns (full rotations) 
//
function spiral( index, maxRadius, turns)
{
	// spiral
    var angle = turns * Math.log(1+index) * 2 * Math.PI;
    var spiralRadius = (index*0.98+0.02)*maxRadius;
 	var x = Math.cos(angle)*spiralRadius; 
    var y = Math.sin(angle)*spiralRadius;
    
    return {x:x, y:y};
}


function updateTime() {
    
    previousDate = currentDate;
    
    currentDate = new Date();    // get current Date object for timing
    
    // currentDate.getSeconds() gives a value from 0-59 (60 seconds in a minute)
    // currentDate.getMilliseconds() gives a value from 0-999 (1000 milliseconds in a second)
    // currentDate.getMinutes() gives a value from 0-59 (60 minutes in an hour)
    // currentDate.getHours() gives a value from 0-23 (24 hours in a day)
    //

    var calcSeconds =  currentDate.getSeconds() + currentDate.getMilliseconds()/max_millis;
    var calcMinutes =  currentDate.getMinutes() + calcSeconds/(max_seconds+1);
    var calcHours =  currentDate.getHours() + calcMinutes/(max_minutes+1);
    
    // TODO - add more math to make more dots... 

	var calcSecondsPrev =  previousDate.getSeconds() + previousDate.getMilliseconds()/max_millis;
    var calcSecondsPrevScaled = parseInt((calcSecondsPrev/(max_seconds+1) * speed * timeScale) % timeScale,10);
    var calcSecondsScaled = parseInt((calcSeconds/(max_seconds+1) * speed * timeScale) % timeScale, 10);

	var calcMinutesPrev =  previousDate.getMinutes() + calcSecondsPrev/(max_seconds+1);
    var calcMinutesPrevScaled = parseInt((calcMinutesPrev/(max_minutes+1) * speed * timeScale) % timeScale,10);
    var calcMinutesScaled = parseInt((calcMinutes/(max_minutes+1) * speed * timeScale) % timeScale, 10);

    
    // if the seconds have changed from 59 to 0 (e.g. a minute passed) then run the function
// 	if (currentDate.getSeconds() != previousDate.getSeconds()) 
// 		nextSecond(timeScale * currentDate.getSeconds()/max_seconds);

 	if (calcSecondsPrevScaled != calcSecondsScaled) 
 		nextSecond(calcSecondsScaled);

 	if (calcMinutesPrevScaled != calcMinutesScaled) 
 		nextMinute(calcMinutesScaled);
	
	
}

//
// start it up!
//
window.addEventListener('load', initCanvas);



// scoreboard downward growing prototype using svg.js

// by Evan Raskob for gameshowhack
// https://twitter.com/evanraskob


//
// Global vars
//

// create svg drawing paper
var svg;

var minutesBlobs, secondsBlobs, hoursBlobs;
var clockRadius; // radius of the whole clock (half the diameter)
var blobRadius;
var previousDate, currentDate;	// for getting the current time and storing it
var turns = 6; // for spiral

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

	var vb = svg.viewbox();
    var centerX = (vb.width / 2);
    var centerY = (vb.height / 2);

	clockRadius = vb.width * 0.8; // leave some padding
	blobRadius = clockRadius/20;

    
	
	var clockFace = svg.circle( clockRadius ).attr('class', 'clock-face')
		.center(centerX, centerY);

	var minutes = svg.group().attr('class', 'minutes');
	var seconds = svg.group().attr('class', 'seconds');
	//seconds.transform({x:centerX, y:centerY});  // doesn't work...
//	var hours = svg.group().attr('class', 'hours');

	// set current time
	currentDate = new Date();
	
	var i=currentDate.getMinutes();
	
	while (minutesBlobs.length <= i)
	{
		nextMinute(minutesBlobs.length);
	}
	var i=currentDate.getSeconds();
	
	while (secondsBlobs.length <= i)
	{
		nextSecond(secondsBlobs.length);
	}
	
	
	setInterval(updateTime, 10);
}


//
// handle next second
//
function nextSecond(seconds) {

	//console.log (seconds);
	if (seconds == 0)
	{
		$("#canvas").toggleClass('end-rotate');
		console.log("toggle rotate");
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
		prevSpiralCoords = spiral (1-(seconds-1)/59, clockRadius/2-blobRadius, turns);
		
		// animate it into position, then remove it afterwards
		secondsBlob.animate(1000, '<')
			.center(
				centerX+prevSpiralCoords.x, 
				centerY+prevSpiralCoords.y
			)
			.size(0,0)
			.after(function() { this.remove(); });
	}
	
	// otherwise, we're adding new ones:
	else 
	{	
		var secondsBlob = secondsGroup.circle(0);
		// linear
		//secondsBlob.center(seconds*blobRadius, centerY);

	
		//spiral

		// last position
		if (seconds > 0)
		{
			var prevSpiralCoords = spiral ((seconds-1)/59, clockRadius/2-blobRadius, turns);
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
		var spiralCoords = spiral (seconds/59, clockRadius/2-blobRadius, turns);
	

		secondsBlob.animate(1000, SVG.easing.quad)
			.size(blobRadius,blobRadius)
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
function nextMinute(minutes) {

	
	if (minutes == 0)
	{
		//$("#canvas").toggleClass('end-rotate');
		// remove old minutes
		while (minutesBlobs.length > 0)
		{
			var blob = minutesBlobs.pop();
			blob.remove();
		}
		
	}
	
	var vb = svg.viewbox();
    var centerX = (vb.width / 2);
    var centerY = (vb.height / 2);
	
	var minutesGroup = $('.minutes');
	if (minutesGroup != null) minutesGroup = minutesGroup[0].instance;

    var minutesBlob = minutesGroup.circle(0);
    // linear
    //minutesBlob.center(minutes*blobRadius, centerY);

    
    //spiral

	// last position
	if (minutes > 0)
	{
    	var prevSpiralCoords = spiral ((minutes-1)/59, clockRadius/2-blobRadius, turns);
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
	var spiralCoords = spiral (minutes/59, clockRadius/2-blobRadius, turns);
    

    minutesBlob.animate(60000, SVG.easing.quad)
    	.size(blobRadius*2,blobRadius*2)
    	.center(
    	centerX+spiralCoords.x, 
    	centerY+spiralCoords.y
    );
	
	// keep reference to this element for later
	minutesBlobs.push(  minutesBlob );
}



//
// return x,y coords of a spiral given an index (0-1) max radius for the spiral
// and the number of turns (full rotations) 
//
function spiral( index, maxRadius, turns)
{
	// spiral
    var angle = turns * Math.log(1+index) * 2 * Math.PI;
    var spiralRadius = index*maxRadius;
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

    var calcSeconds =  currentDate.getSeconds() + currentDate.getMilliseconds()/999;
    var calcMinutes =  currentDate.getMinutes() + calcSeconds/60;
    var calcHours =  currentDate.getHours() + calcMinutes/60;
        
    // if the seconds have changed from 59 to 0 (e.g. a minute passed) then run the function
	if (currentDate.getSeconds() != previousDate.getSeconds()) 
		nextSecond(currentDate.getSeconds());

    // if the seconds have changed from 59 to 0 (e.g. a minute passed) then run the function
	if (currentDate.getMinutes() != previousDate.getMinutes()) 
		nextMinute(currentDate.getMinutes());
	
	
}

//
// start it up!
//
window.addEventListener('load', initCanvas);



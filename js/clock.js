/** 
 * By Evan Raskob (http://twitter.com/evanraskob),
*/

var handRotation = 0;  // degrees the hand is rotated


function rotateHand() 
{
  var clockHand = document.getElementById("minutehand");
  var rx = clockHand.getAttribute('x1');
  var ry = clockHand.getAttribute('y1');
  
  clockHand.setAttribute('transform', 'rotate('+handRotation+','+rx+','+ry+')');
  
  // 1 full rotation (360 degrees) is 60,000ms
  // (1000*60). Since this function will run every 
  // 20ms, that means that each time it runs 
  // gets us 20*1/60000th closer to a full rotation  
  handRotation = handRotation+360*20/(1000*60);
  
  // this should count out the seconds
  //console.log("seconds:" + handRotation/6);
  
  if (handRotation > 359)
  {
    handRotation = 0;
  }
  
}
  
//run the expansion function every 600ms (0.6s)
setInterval( rotateHand, 20 );


let img;
let numSegments = 80;
let segments;
let layer1;
let t=0.05;
let currentSlide = 0;
let cube = [];
let imgBorderSize = 10;

//a variable to hold background animation
let myAnimation;

//a variable to switch between drawing the image and the segments
let drawSegments = true;

//an object to hold the draw properties of the image
let imgDrwPrps = {aspect: 0, width: 0, height: 0, xOffset: 0, yOffset: 0};

//a variable for the canvas aspect ratio
let canvasAspectRatio = 0;


function preload() {
  img = loadImage('assets/Edvard_Munch_The_Scream.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  //calculate the aspect ratio of the image - this will never change so we only need to do it once
  
  imgDrwPrps.aspect = img.width / img.height;
  //calculate the draw properties of the image using the function we made
  calculateImageDrawProps();
  startAnimationsAutomatically(); 

  for (let i = 0; i < 10; i++) {
		cube.push(new Cube())
	}

  //set the animation
  myAnimation = new AnimatedEllipses(img);

  //set the array
  //use the width and height of the image to calculate the size of each segment
  let segmentWidth = img.width / numSegments;
  let segmentHeight = img.height / numSegments;

  segments = make2Darray(numSegments, numSegments); // Initialize the 2D array
  layer1 = make2Darray(numSegments, numSegments); // Initialize the new layer 2D array

  //the column position of every segment, we set it outside the loop 
  let positionInColumn = 0;
  for (let y = 0; y < numSegments; y++) {
      let positionInRow = 0
    for (let x = 0; x < numSegments; x++) {
      let segXPos = x * segmentWidth;
      let segYPos = y * segmentHeight;
      let segmentColour = img.get(segXPos + segmentWidth / 2, segYPos + segmentHeight / 2);
      segments[y][x] = new ImageSegment(positionInColumn, positionInRow,segmentColour);
      segments[y][x].calculateSegDrawProps(); 

      // Create a new Layer element
      layer1[y][x] = new Layer(positionInColumn, positionInRow);
      layer1[y][x].calculateSegDrawProps(); 

      positionInRow++;
    }
    positionInColumn++;
  }
}


//draw section
//switch mode to change between 2 slides
function draw() {

	if (currentSlide == 0) {
		slide0();
	} else if (currentSlide == 1) {
		slide1();
	} 

}

//slide0 to present
//time-based animation
function slide0() {
	background(0,10);
	push();
	for (let i = 0; i < cube.length; i++) {
		cube[i].draw();
	}
	rotate(frameCount * 0.025);

  drawImageBorder();
  pop();

  drawImageFrame();
	
}

//main slide to present
//process of artwork
function slide1(){
  background(0,20);

  drawImageFrame();
  drawImageBorder();

  for (let i = 0; i < cube.length; i++) {
		cube[i].draw();
	}

  if (drawSegments) {
  //draw the segments to the canvas
  for (let y = 0; y < segments.length; y++) {
    for (let x = 0; x < segments[y].length; x++) {
      segments[y][x].updateShape(); // update animation
      segments[y][x].draw();
      layer1[y][x].updateColor();
      layer1[y][x].updateOffset(); // update animation
      layer1[y][x].drawLayer(); // Draw the new layer
    }
  }
} else {
  //draw the image to the canvas
  image(img, imgDrwPrps.xOffset, imgDrwPrps.yOffset, imgDrwPrps.width, imgDrwPrps.height);
}

//display background animation
myAnimation.display();

}


//other function section
//
function drawImageFrame() {
  let imageX = imgDrwPrps.xOffset;
  let imageY = imgDrwPrps.yOffset;
  let imageW = imgDrwPrps.width;
  let imageH = imgDrwPrps.height;
  push();
  noFill();
  strokeWeight(10)
  stroke(255);
  rect(imageX, imageY, imageW, imageH);
  pop();

  noFill();
  strokeWeight(2);
  stroke(66,98,255);
  rect(imageX, imageY, imageW, imageH);
}

function drawImageBorder() {
  push()
    let imageBorderX = imgDrwPrps.xOffset - 3 * imgBorderSize;
    let imageBorderY = imgDrwPrps.yOffset - imgBorderSize;
    let imageBorderW = img.width - 3 * imgBorderSize;
    let imageBorderH = img.height - 2 * imgBorderSize;
  noFill();
  strokeWeight(10)
  stroke(95,95,211,100);
  rect(imageBorderX, imageBorderY, imageBorderW, imageBorderH);
  pop()
}

//function to start explode animation
function startAnimationsAutomatically() {
  let index = 0;
  const timeInterval = 10; // set time interval for animation as 0.01s

  const animationInterval = setInterval(() => {
    if (index < segments.length * segments[0].length) {
      let x = index % numSegments;
      let y = Math.floor(index / numSegments);
      segments[y][x].startAnimation(random(width), random(height)); // 假设这里你希望随机设置位置
      index++;
    } else {
      clearInterval(animationInterval); // 停止动画循环
    }
  }, timeInterval);
}


//function to change between 2 slides
function mousePressed() {
	let numberOfSlides = 2
	currentSlide = (currentSlide + 1) % numberOfSlides;

}

//function to preset 2d array
function make2Darray(cols, rows) {
  var arr = new Array(cols);
  for (var i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows);
  }
  return arr;

}

//function to change between original artwork and processed one
function keyPressed() {
  if (key == " ") {
    drawSegments = !drawSegments;
  }
}

//scale to respond to window size change
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateImageDrawProps();
  for (let y = 0; y < numSegments; y++) {
    for (let x = 0; x < numSegments; x++) {
      segments[y][x].calculateSegDrawProps(); 
      layer1[y][x].calculateSegDrawProps(); 
    }
  }
}

function calculateImageDrawProps() {
  //Calculate the aspect ratio of the canvas
  canvasAspectRatio = width / height;
  //if the image is wider than the canvas
  if (imgDrwPrps.aspect > canvasAspectRatio) {
    //then we will draw the image to the width of the canvas
    imgDrwPrps.width = width;
    //and calculate the height based on the aspect ratio
    imgDrwPrps.height = width / imgDrwPrps.aspect;
    imgDrwPrps.yOffset = (height - imgDrwPrps.height) / 2;
    imgDrwPrps.xOffset = 0;
  } else if (imgDrwPrps.aspect < canvasAspectRatio) {
    //otherwise we will draw the image to the height of the canvas
    imgDrwPrps.height = height;
    //and calculate the width based on the aspect ratio
    imgDrwPrps.width = height * imgDrwPrps.aspect;
    imgDrwPrps.xOffset = (width - imgDrwPrps.width) / 2;
    imgDrwPrps.yOffset = 0;
  }
  else if (imgDrwPrps.aspect == canvasAspectRatio) {
    //if the aspect ratios are the same then we can draw the image to the canvas size
    imgDrwPrps.width = width;
    imgDrwPrps.height = height;
    imgDrwPrps.xOffset = 0;
    imgDrwPrps.yOffset = 0;
  }
}

class Cube{
  constructor() {
    
    this.drawXPos = random(windowWidth);  
    this.drawYPos = random(windowHeight); 
    this.squareSize = random(50,100)
    this.squareSizeTarget = random(50,100)

  }

  draw(){
    noFill()
    stroke(66,98,255);
    square(this.drawXPos, this.drawYPos, this.squareSize);

    //create auto-updated size
    this.squareSize = lerp(this.squareSize, this.squareSizeTarget, t);

    if (frameCount%50==0){
      this.squareSizeTarget = random(50, 150);
      }
    }

}


//class section

class AnimatedEllipses {
  constructor(img) {
    this.img = img;
    this.smallPoint = 4;
    this.largePoint = 40;
    this.startTime = millis(); // Record the start time
    this.duration = 3000; // Animation duration in milliseconds
  }

  display() {
    let currentTime = millis() - this.startTime; // Calculate the time elapsed

    // Calculate the lerpAmount, pointillize, and targetSize based on the time elapsed
    let lerpAmount = map(currentTime % this.duration, 0, this.duration, 0, 0.05);
    let pointillize = map(currentTime % this.duration, 0, this.duration, this.smallPoint, this.largePoint/2);
    let targetSize = map(currentTime % this.duration, 0, this.duration, 0, 50);

    // get random XPos and YPos in image
    let x1 = imgDrwPrps.xOffset + floor(random(imgDrwPrps.width));
    let y1 = imgDrwPrps.yOffset + floor(random(imgDrwPrps.height));

    let x2 = floor(random(imgDrwPrps.width));
    let y2 = floor(random(imgDrwPrps.height));

    let x3 = imgDrwPrps.xOffset + imgDrwPrps.width + floor(random(imgDrwPrps.width));
    let y3 = imgDrwPrps.yOffset + floor(random(imgDrwPrps.height));

    // Get the color of the pixel at position (x2, y2)
    let col = this.img.get(x2, y2);

    // Extract red, green, blue components
    let r = red(col);
    let g = green(col);
    let b = blue(col);

    // Calculate grayscale from RGB components
    let gray = int((r + g + b) / 3); // Simple grayscale averaging

    // Map the grayscale value to a color range from white to blue
    let whiteColor = color(255);
    let blueColor = color(95,95,211);
    let mappedColor = lerpColor(whiteColor, blueColor, map(gray, 0, 255, 0, 1));

    fill(mappedColor);

    pointillize = lerp(pointillize, targetSize, lerpAmount);
    ellipse(x1, y1, pointillize, pointillize);
    ellipse(x2, y2, pointillize, pointillize);
    ellipse(x3, y3, pointillize, pointillize);  

  }
}


class ImageSegment {
  constructor(columnPositionInPrm, rowPostionInPrm  ,srcImgSegColourInPrm) {
    //The row and column position give relative position of the segment in the image that do not change when the image is resized
    //use these to calculate the x and y position of the segment when we draw it

    this.columnPosition = columnPositionInPrm;
    this.rowPostion = rowPostionInPrm;
    this.srcImgSegColour = srcImgSegColourInPrm;
    ////calculate these parameters later
    this.drawXPos = 0;
    this.drawYPos = 0;
    this.drawWidth = 0;
    this.drawHeight = 0;
  
    //make explode animation
    this.targetXPos = this.drawXPos; 
    this.targetYPos = this.drawYPos; 
    this.animSpeed = 0.05; 

    this.isAnimating = false; 
  }

  startAnimation(newX, newY) {
    this.targetXPos = newX;
    this.targetYPos = newY;
    this.isAnimating = true; //start animation
  }
  

  calculateSegDrawProps() {
    //use the width and height we calculated for the image to be drawn, to calculate the size of each segment
    this.drawWidth = imgDrwPrps.width / numSegments;
    this.drawHeight = imgDrwPrps.height / numSegments;
    
    this.drawXPos = this.rowPostion * this.drawWidth + imgDrwPrps.xOffset;
    this.drawYPos = this.columnPosition * this.drawHeight + imgDrwPrps.yOffset;
  }

  updateShape() {
    let animationSpeed = 0.05;
    let size = 9 + sin(frameCount * animationSpeed) * 15; // 计算形状尺寸
    this.drawWidth = size;
    this.drawHeight = size;
  }

  draw() {

    //set animation process
    if (this.isAnimating) {
      // calculate new position for lego cubes
      this.drawXPos = lerp(this.drawXPos, this.targetXPos, this.animSpeed);
      this.drawYPos = lerp(this.drawYPos, this.targetYPos, this.animSpeed);
  
      // stop animation when close to tartget
      if (dist(this.drawXPos, this.drawYPos, this.targetXPos, this.targetYPos) < 0.1) {
        this.isAnimating = false;
        this.drawXPos = this.targetXPos;
        this.drawYPos = this.targetYPos;
      }
    }

    let depth = 3;
    
    let highlightColor = color(red(this.srcImgSegColour) * 1.4, green(this.srcImgSegColour) * 1.4, blue(this.srcImgSegColour) * 1.4);

    // Main block color
    fill(this.srcImgSegColour);
    noStroke();
    //Then draw the segment as a rectangle, using the draw properties we calculated
    rect(this.drawXPos, this.drawYPos, this.drawWidth, this.drawHeight);
    
    // Top highlight
    fill(highlightColor);
    beginShape();
      vertex(this.drawXPos, this.drawYPos);
      vertex(this.drawXPos + this.drawWidth, this.drawYPos);
      vertex(this.drawXPos + this.drawWidth - depth, this.drawYPos - depth);
      vertex(this.drawXPos - depth, this.drawYPos - depth);
    endShape(CLOSE);

    let bumpDiameter = min(this.drawWidth, this.drawHeight) * 0.4;
    // Shadow for bump
    fill(0, 0, 0, 150); // semi-transparent black for shadow
    ellipse(this.drawXPos + this.drawWidth * 0.5 + 2, this.drawYPos + this.drawHeight * 0.5 - 0.5, bumpDiameter, bumpDiameter);
    
    // Lego bump
    fill(220);
    ellipse(this.drawXPos + this.drawWidth * 0.5, this.drawYPos + this.drawHeight * 0.5-2, bumpDiameter, bumpDiameter);
 
  }
}


class Layer {
  constructor(columnPositionInPrm, rowPostionInPrm  ,srcImgSegColourInPrm) {
    //The row and column position give us relative position of the segment in the image that do not change when the image is resized
    //We will use these to calculate the x and y position of the segment when we draw it

    this.columnPosition = columnPositionInPrm;
    this.rowPostion = rowPostionInPrm;
    this.srcImgSegColour = srcImgSegColourInPrm;
    //These parameters are not set when we create the segment object, we will calculate them later
    this.drawXPos = 0;
    this.drawYPos = 0;
    this.drawWidth = 0;
    this.drawHeight = 0;

  }

  calculateSegDrawProps() {
    this.drawWidth = imgDrwPrps.width / numSegments;
    this.drawHeight = imgDrwPrps.height / numSegments;

    this.drawXPos = this.rowPostion * this.drawWidth + imgDrwPrps.xOffset;
    this.drawYPos = this.columnPosition * this.drawHeight + imgDrwPrps.yOffset;
  }

  updateOffset() {
    let animationSpeed = 0.05; 
    let offset = sin(frameCount * animationSpeed) * 20; // calculate offset on Y
    this.drawYPos += offset;
  }

  updateColor() {
    let animationSpeed = 0.05; 
    let r = map(sin(frameCount * animationSpeed), -1, 1, 90, 220); // 根据sin函数映射红色分量
    let g = map(sin(frameCount * animationSpeed), -1, 1, 50, 250); // 根据sin函数映射绿色分量
    let b = map(sin(frameCount * animationSpeed), -1, 1, 50, 255); // 根据sin函数映射蓝色分量
    this.srcImgSegColour = color(r, g, b);
  }
    
  drawLayer() {
    push(); 
    fill(this.srcImgSegColour , 200);
    rect(this.drawXPos, this.drawYPos, this.drawWidth, this.drawHeight/3);
    pop(); 
  }
}

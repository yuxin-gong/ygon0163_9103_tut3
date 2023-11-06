

let img;
let numSegments = 80;
let segments;
let layer1;

//lets add a variable to switch between drawing the image and the segments
let drawSegments = true;

//Let's make an object to hold the draw properties of the image
let imgDrwPrps = {aspect: 0, width: 0, height: 0, xOffset: 0, yOffset: 0};

//And a variable for the canvas aspect ratio
let canvasAspectRatio = 0;


function preload() {
  img = loadImage('assets/Edvard_Munch_The_Scream.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  //let's calculate the aspect ratio of the image - this will never change so we only need to do it once
  imgDrwPrps.aspect = img.width / img.height;
  //now let's calculate the draw properties of the image using the function we made
  calculateImageDrawProps();
  startAnimationsAutomatically(); 

  //use the width and height of the image to calculate the size of each segment
  let segmentWidth = img.width / numSegments;
  let segmentHeight = img.height / numSegments;


  segments = make2Darray(numSegments, numSegments); // Initialize the 2D array
  layer1 = make2Darray(numSegments, numSegments); // Initialize the new layer 2D array

  //this will be the column position of every segment, we set it outside the loop 
  let positionInColumn = 0;
  for (let y = 0; y < numSegments; y++) {
      //this is looping over the height
      let positionInRow = 0
    for (let x = 0; x < numSegments; x++) {
      let segXPos = x * segmentWidth;
      let segYPos = y * segmentHeight;
      let segmentColour = img.get(segXPos + segmentWidth / 2, segYPos + segmentHeight / 2);
      segments[y][x] = new ImageSegment(positionInColumn, positionInRow,segmentColour);
      segments[y][x].calculateSegDrawProps(); 

      // Create a new Layer element
      layer1[y][x] = new Layer(segXPos, segYPos, segmentWidth, segmentHeight, segXPos, segYPos, segmentWidth/2, segmentHeight/2);

      positionInRow++;
    }
    positionInColumn++;
  }
}

function draw() {
  background(0);
  if (drawSegments) {
  //lets draw the segments to the canvas
  for (let y = 0; y < segments.length; y++) {
    for (let x = 0; x < segments[y].length; x++) {
      segments[y][x].draw();
      layer1[y][x].drawLayer(); // Draw the new layer
    }
  }
} else {
  //lets draw the image to the canvas
  image(img, imgDrwPrps.xOffset, imgDrwPrps.yOffset, imgDrwPrps.width, imgDrwPrps.height);
}


}

function keyPressed() {
  if (key == " ") {
    drawSegments = !drawSegments;
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  calculateImageDrawProps();
  for (let y = 0; y < numSegments; y++) {
    for (let x = 0; x < numSegments; x++) {
      segments[y][x].calculateSegDrawProps(); 
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

class ImageSegment {
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

    // 为了实现动画效果，添加新的属性
    this.targetXPos = this.drawXPos; // 最初的X位置
    this.targetYPos = this.drawYPos; // 最初的Y位置
    this.animSpeed = 0.05; // 动画速度，可以调整

    this.isAnimating = false; // 确认是否在执行动画
  }

  startAnimation(newX, newY) {
    this.targetXPos = newX;
    this.targetYPos = newY;
    this.isAnimating = true; // 启动动画
  }
  

  calculateSegDrawProps() {
    //Here is where we will calculate the draw properties of the segment.
    //The width and height are easy to calculate, remember the image made of segments is always the same size as the whole image even when it is resized
    //We can use the width and height we calculated for the image to be drawn, to calculate the size of each segment
    this.drawWidth = imgDrwPrps.width / numSegments;
    this.drawHeight = imgDrwPrps.height / numSegments;
    
    //we can use the row and column position to calculate the x and y position of the segment

    //The x position is the row position multiplied by the width of the segment plus the x offset we calculated for the image
    this.drawXPos = this.rowPostion * this.drawWidth + imgDrwPrps.xOffset;
    //The y position is the column position multiplied by the height of the segment plus the y offset we calculated for the image
    this.drawYPos = this.columnPosition * this.drawHeight + imgDrwPrps.yOffset;
  }

  draw() {

    if (this.isAnimating) {
      // 计算新位置，以使图块移动到目标位置
      this.drawXPos = lerp(this.drawXPos, this.targetXPos, this.animSpeed);
      this.drawYPos = lerp(this.drawYPos, this.targetYPos, this.animSpeed);
  
      // 当接近目标位置时，停止动画
      if (dist(this.drawXPos, this.drawYPos, this.targetXPos, this.targetYPos) < 0.1) {
        this.isAnimating = false;
        this.drawXPos = this.targetXPos;
        this.drawYPos = this.targetYPos;
      }
    }

    let depth = 3;
    
    let shadowColor = color(red(this.srcImgSegColour) * 0.6, green(this.srcImgSegColour) * 0.6, blue(this.srcImgSegColour) * 0.6);
    let highlightColor = color(red(this.srcImgSegColour) * 1.4, green(this.srcImgSegColour) * 1.4, blue(this.srcImgSegColour) * 1.4);

    // Main block color
    fill(this.srcImgSegColour);
    noStroke();
    //Then draw the segment as a rectangle, using the draw properties we calculated
    rect(this.drawXPos, this.drawYPos, this.drawWidth, this.drawHeight);

    // Left shadow
    fill(shadowColor);
    beginShape();
      vertex(this.drawXPos, this.drawYPos);
      vertex(this.drawXPos - depth, this.drawYPos - depth);
      vertex(this.drawXPos - depth, this.drawYPos + this.drawHeight - depth);
      vertex(this.drawXPos, this.drawYPos + this.drawHeight);
    endShape(CLOSE);
    
    // Top highlight
    fill(highlightColor);
    beginShape();
      vertex(this.drawXPos, this.drawYPos);
      vertex(this.drawXPos + this.drawWidth, this.drawYPos);
      vertex(this.drawXPos + this.drawWidth - depth, this.drawYPos - depth);
      vertex(this.drawXPos - depth, this.drawYPos - depth);
    endShape(CLOSE);

    let bumpDiameter = min(this.srcImgSegWidth, this.srcImgSegHeight) * 0.4;
    // Shadow for bump
    fill(0, 0, 0, 150); // semi-transparent black for shadow
    ellipse(this.drawXPos + this.drawWidth * 0.5 + 2, this.drawYPos + this.drawHeight * 0.5-0.5, bumpDiameter, bumpDiameter);

    // Lego bump
    fill(220);
    ellipse(this.drawXPos + this.drawWidth * 0.5, this.drawYPos + this.drawHeight * 0.5-2, bumpDiameter, bumpDiameter);
    

    fill(220)
    rect(50,50,100,100)
  }
}

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

function make2Darray(cols, rows) {
  var arr = new Array(cols);
  for (var i = 0; i < arr.length; i++) {
    arr[i] = new Array(rows);
  }
  return arr;

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

  drawLayer() {
    // draw in specific area
    push(); //store current form
    //translate(this.segX, this.segY); 
    fill(100, 255, 100, 100);
    rect(this.drawXPos, this.drawYPos, this.drawWidth, 10);
    // if (this.x >= 0 && this.y >= 0 && this.x + this.width <= this.segWidth/2 && this.y + this.height <= this.segHeight/2) {
    //   console.log("Width: " + this.width + "\n" + "Height: " + this.height +
    //               "xPos: " + this.x + "\n" + "ypos: " + this.y + "\n" + "");
    //   fill(255, 255, 0); 
    //   rect(this.x, this.y, this.width, this.height);

    //  }
    pop(); 
      // add more functions to draw elements
  }
}

// other functions here...W
let video;

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.hide();
}

function draw() {
  background('#e7c6ff');

  if (video.loadedmetadata) {
    let imgWidth = width * 0.5;
    let imgHeight = height * 0.5;

    push();
    translate(width / 2, height / 2);
    scale(-1, 1);
    imageMode(CENTER);
    image(video, 0, 0, imgWidth, imgHeight);
    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

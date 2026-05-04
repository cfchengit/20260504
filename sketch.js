let video;
let faceMesh;
let faces = [];

function preload() {
  faceMesh = ml5.faceMesh();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.hide();
  faceMesh.detectStart(video, gotFaces);
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

    // 如果有辨識到臉部
    if (faces.length > 0) {
      let face = faces[0];
      let outerLips = [409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291];
      let innerLips = [76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184];
      
      // 畫面左側的眼睛 (在模型上對應人體的右眼) 的外圈與內圈
      let leftEyeOuter = [130, 247, 30, 29, 27, 28, 56, 190, 243, 112, 26, 22, 23, 24, 110, 25];
      let leftEyeInner = [33, 246, 161, 160, 159, 158, 157, 173, 133, 155, 154, 153, 145, 144, 163, 7];
      
      // 畫面右側的眼睛 (在模型上對應人體的左眼) 的外圈與內圈
      let rightEyeOuter = [359, 467, 260, 259, 257, 258, 286, 414, 463, 341, 256, 252, 253, 254, 339, 255];
      let rightEyeInner = [263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249];
      let allIndices = [outerLips, innerLips, leftEyeOuter, leftEyeInner, rightEyeOuter, rightEyeInner];

      stroke(255, 0, 0); // 線條顏色為紅色
      strokeWeight(1);   // 線條粗細為 1

      // 將這些點依序連起來形成輪廓 (含將最後一點連回第一點)
      for (let indices of allIndices) {
        for (let i = 0; i < indices.length; i++) {
          let p1 = face.keypoints[indices[i]];
          let p2 = face.keypoints[indices[(i + 1) % indices.length]];

          if (p1 && p2) {
            // 將特徵點的座標映射(map)到目前畫布置中且 50% 縮放的座標系上
            let x1 = map(p1.x, 0, video.width, -imgWidth / 2, imgWidth / 2);
            let y1 = map(p1.y, 0, video.height, -imgHeight / 2, imgHeight / 2);
            let x2 = map(p2.x, 0, video.width, -imgWidth / 2, imgWidth / 2);
            let y2 = map(p2.y, 0, video.height, -imgHeight / 2, imgHeight / 2);

            line(x1, y1, x2, y2);
          }
        }
      }
    }

    pop();
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function gotFaces(results) {
  faces = results;
}

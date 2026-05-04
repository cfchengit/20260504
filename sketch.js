let video;
let faceMesh;
let faces = [];
let stars = []; // 儲存星星資料的陣列

function preload() {
  faceMesh = ml5.faceMesh();
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.hide();
  faceMesh.detectStart(video, gotFaces);

  // 隨機產生 150 顆星星的相對位置與大小
  for (let i = 0; i < 150; i++) {
    stars.push({
      x: random(-0.5, 0.5), // 儲存比例而非絕對座標，以便適應視窗縮放
      y: random(-0.5, 0.5),
      r: random(1, 3)      // 隨機半徑 1~3 像素
    });
  }
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
      
      // 臉部最外層輪廓 (Face Oval)
      let faceOval = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
      let allIndices = [outerLips, innerLips, leftEyeOuter, leftEyeInner, rightEyeOuter, rightEyeInner, faceOval];

      // 將擷取影像區域先塗成黑色
      fill(0);
      noStroke();
      rectMode(CENTER);
      rect(0, 0, imgWidth, imgHeight);

      // 在黑色背景上畫出隨機閃爍的白色星星
      for (let star of stars) {
        fill(255, random(100, 255)); // 隨機透明度產生閃爍感
        circle(star.x * imgWidth, star.y * imgHeight, star.r);
      }

      // 利用 clip() 遮罩，只在臉部輪廓內繪製攝影機畫面
      push();
      beginShape();
      for (let i = 0; i < faceOval.length; i++) {
        let p = face.keypoints[faceOval[i]];
        let x = map(p.x, 0, video.width, -imgWidth / 2, imgWidth / 2);
        let y = map(p.y, 0, video.height, -imgHeight / 2, imgHeight / 2);
        vertex(x, y);
      }
      endShape(CLOSE);
      drawingContext.clip();
      image(video, 0, 0, imgWidth, imgHeight);
      pop();

      noFill();          // 畫線不填滿
      stroke(255, 0, 0); // 線條顏色為紅色
      strokeWeight(1);   // 線條粗細為 1

      // 將這些點依序連起來形成輪廓 (含將最後一點連回第一點)
      for (let indices of allIndices) {
        // 若為臉部外層輪廓 (faceOval)，加上紅色光暈創造霓虹燈效果
        if (indices === faceOval) {
          drawingContext.shadowBlur = 20;
          drawingContext.shadowColor = 'red';
        } else {
          drawingContext.shadowBlur = 0;
        }

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
      
      // 重置光暈設定，避免影響後續或下一幀的繪圖（如背景與星星）
      drawingContext.shadowBlur = 0;
    } else {
      // 若畫面中沒有偵測到臉部，則正常顯示原本的攝影機畫面
      image(video, 0, 0, imgWidth, imgHeight);
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

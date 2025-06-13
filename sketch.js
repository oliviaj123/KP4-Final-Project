let player;
let platforms = [];
let segments = [];
let totalSegments = 15;
let platformHeight;
let platformWidth;

let waterfallLeft;
let waterfallRight;
let waterfallTop;
let waterfallBottom;

let textsize = 30;

let creatureMessageTimer = 0;
let creatureMessageDuration = 240;
let currentCreatureMessage = "";
let creatureMessages = [
  "It watches you quietly...",
  "A strange presence lingers.",
  "You feel its ancient gaze.",
  "Do you have any games on your phone?",
  "She's just a girl",
  "You like anime?"
];



class Orbiter {
  constructor(parentSegment) {
    this.parent = parentSegment;
    this.baseOrbitRadius = random(8,70);
    this.orbitRadius = this.baseOrbitRadius;
    this.orbitAngle = random(TWO_PI);
    this.offset = random(0.1, 0.3);
    this.angularSpeed = random(0.01, 0.05);
    this.size = random(5, 15);

    this.radiusOscillationAmplitude = random(3, 8);
    this.radiusOscillationFrequency = random(0.01, 0.05);
    this.radiusOscillationPhase = random(TWO_PI);

    this.pos = createVector(parentSegment.pos.x, parentSegment.pos.y);

    // Velocity for bounce effect (small random initial velocity)
    this.vel = p5.Vector.random2D().mult(0.5);
  }

  update(t) {
    this.orbitAngle += this.angularSpeed;

    let targetRadius = this.baseOrbitRadius +
      sin(t * this.radiusOscillationFrequency + this.radiusOscillationPhase) * this.radiusOscillationAmplitude;

    this.orbitRadius = lerp(this.orbitRadius, targetRadius, 0.05);

    // Orbit position without bounce offset
    let offsetX = this.orbitRadius * cos(this.orbitAngle);
    let offsetY = this.orbitRadius * sin(this.orbitAngle);
    let baseTarget = p5.Vector.add(this.parent.pos, createVector(offsetX, offsetY));

    // Update velocity and position for bounce effect
    this.pos.add(this.vel);

    // Lerp position towards baseTarget (orbit) with some weight to keep orbit
    this.pos.lerp(baseTarget, this.offset);
  }

  display() {
    fill('#6DFF1B75');
    noStroke();
    circle(this.pos.x, this.pos.y, this.size * 2);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  waterfallLeft = width * 0.75;
  waterfallRight = width * 0.95;
  waterfallTop = height * 0.3;
  waterfallBottom = height;
  
  platformHeight = height*0.025;
  platformWidth = width*0.25;
  
  // Create player at starting position
  player = { x: width/2, y: height - 30, radius: 20, ySpeed: 0, xSpeed: 0, onGround: false };

  platforms.push({ x: width * 0.1, y: height * 0.75, w: platformWidth, h: platformHeight, e:30, isMoving: false });
  platforms.push({ x: width * 0.5, y: height * 0.55, w: platformWidth*0.7, h: platformHeight, e:30, isMoving: true, baseX: width * 0.5, amplitude: width * 0.08, speed: 0.02 });
  platforms.push({ x: width * 0.25, y: height * 0.35, w: platformWidth*0.9, h: platformHeight, e:30, isMoving: false });
  platforms.push({ x: width *0.1, y: height * 0.15, w: platformWidth, h: platformHeight, e:30, isMoving: true, baseX: width * 0.6, amplitude: width * 0.1, speed: 0.035 });
  // Floor (full width)
  platforms.push({ x: 0, y: height - 20, w: width, h: platformHeight, e:0, isMoving: false });

  let maxOrbiters = 20;
  let minOrbiters = 1;

  
  for (let i = 0; i < totalSegments; i++) {
    let segment = {
      pos: createVector(width / 2, height / 2),
      size: map(i, 0, totalSegments - 1, 5, 2) + random(0.5, 1.5),
      noiseOffset: random(1000),
      orbiters: []
    };

    // Vary number of orbiters based on position in chain
    maxOrbiters = maxOrbiters * 0.85;
    segment.baseOrbitRadius = segment.baseOrbitRadius * 0.5;
    let nOrbiters = floor(map(i, 0, totalSegments - 1, maxOrbiters, minOrbiters));
    for (let j = 0; j < nOrbiters; j++) {
      segment.orbiters.push(new Orbiter(segment, i, totalSegments));
    }

    segments.push(segment);
  }

}

function draw() {
  background('#100D09');
  
  fill('#66635B');
  beginShape();
  vertex(0, height);
  let xoff2 = 0.1;
  for (let x = 0; x <= width; x += 5) {
    let y = map(noise(xoff2), 0, 1, height * 0.1, height * 0.3);
    vertex(x, y);
    xoff2 += 0.005; 
  }
  vertex(width, height);
  endShape(CLOSE);
  
  fill('#A59E8C');
  beginShape();
  vertex(0, height);
  let xoff1 = 0.1;
  for (let x = 0; x <= width; x += 5) {
    let y = map(noise(xoff1), 0, 1, height * 0.3, height * 0.5);
    vertex(x, y);
    xoff1 += 0.01; 
  }
  vertex(width, height);
  endShape(CLOSE);
  
  fill('#D7CEB2');
  beginShape();
  vertex(0, height);
  let xoff = 0;
  for (let x = 0; x <= width; x += 5) {
    let y = map(noise(xoff), 0, 1, height * 0.5, height * 0.8);
    vertex(x, y);
    xoff += 0.02; 
  }
  vertex(width, height);
  endShape(CLOSE);

  //waterfall rock
  fill('#4C5760');
  beginShape();
  vertex(width/2, height);
    // Create noise-based vertices from width/2 to width*0.8
  let steps = 20; // number of intermediate points
  for (let i = 0; i <= steps; i++) {
    let t = i / steps;
    let x = lerp(width / 2, width * 0.8, t);
    let y = lerp(height, 0, t);  
  // Apply vertical noise displacement
  let yOffset = map(noise(t * 2, 5), 0, 1, -150, 150);
  vertex(x, y + yOffset);
}
  vertex(width*0.8, 0);
  vertex(width, 0);
  vertex(width, height);
  endShape(CLOSE);
  
  // Gravity
  player.ySpeed += 0.5;

  // Horizontal movement
  player.x += player.xSpeed;

  // Vertical movement
  player.y += player.ySpeed;
  player.onGround = false;

  for (let plat of platforms) {
    if (plat.isMoving) {
      plat.x = plat.baseX + sin(frameCount * plat.speed) * plat.amplitude;
    }
    fill('#6B704E');
    // strokeWeight(2);
    // stroke('#6C7425');
    rect(plat.x, plat.y, plat.w, plat.h, plat.e);

    // Collision detection (player landing on top of platform)
    if (player.x > plat.x && player.x < plat.x + plat.w) {
      if (player.y + player.radius > plat.y && player.y + player.radius < plat.y + plat.h) {
        player.y = plat.y - player.radius;
        player.ySpeed = 0;
        player.onGround = true;
      }
    }
  }

  let insideWaterfall = (
  player.x > waterfallLeft &&
  player.x < waterfallRight &&
  player.y + player.radius > waterfallTop &&
  player.y - player.radius < waterfallBottom
  );

  if (insideWaterfall) {
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(textsize);
  text("No secret place behing the waterfall...", player.x, player.y - player.radius - 30);
  }

  // Draw player
  fill('#E59D39');  
  ellipse(player.x, player.y, player.radius*2);
  
  // Waterfall shape with curved edges
  fill('#B0E4E4AD');
  beginShape();

  // Bottom left corner
  vertex(width * 0.75, height);

  // Noisy left edge (curved inward at top)
  let steps1 = 20;
  for (let i = 0; i <= steps1; i++) {
    let t = i / steps1;
    let x = lerp(width * 0.75, width * 0.8, t);
    let y = lerp(height, height * 0.3, t);
    let xOffset = noise(t * 5, frameCount * 0.05) * 20 - 10;

    // Add curve inward at top
    let curveIn = pow(1 - t, 2); // more curve near the top
    x -= curveIn * 10;

    vertex(x + xOffset, y);
  }

  // Curved top edge with slight downward arch
  let topEdgeSteps = 10;
  for (let i = 0; i <= topEdgeSteps; i++) {
    let t = i / topEdgeSteps;
    let x = lerp(width * 0.8, width * 0.9, t);

    // Add a sag in the center of the top edge
    let yBase = height * 0.3;
    let ySag = -sin(t * PI) * 10; // inverted (convex)
    let y = yBase + ySag;

    vertex(x, y);
  }

  // Noisy right edge (curved inward at top)
  for (let i = 0; i <= steps1; i++) {
    let t = i / steps1;
    let x = lerp(width * 0.9, width * 0.95, t);
    let y = lerp(height * 0.3, height, t);
    let xOffset = noise(100 + t * 5, frameCount * 0.05) * 20 - 10;

    // Add inward curve toward the top
    let curveIn = pow(t, 2); // more curve near the top
    x += curveIn * 10;

    vertex(x + xOffset, y);
  }

  endShape(CLOSE);

  // Constrain player to canvas
  player.x = constrain(player.x, player.radius, width - player.radius);
  if (player.y > height) {
    // Reset if player falls
    player.x = 100;
    player.y = 300;
    player.ySpeed = 0;
  }
  
  let t = frameCount * 0.01;
  let t2 = frameCount;

  // Head movement
  let head = segments[0];
  let angle = noise(t, t * 0.3) * TWO_PI * 2;
  let dir = p5.Vector.fromAngle(angle).mult(5);
  head.pos.add(dir);
  head.pos.x = constrain(head.pos.x, 0, width);
  head.pos.y = constrain(head.pos.y, 0, height);


  // Segment following
  for (let i = 1; i < segments.length; i++) {
    let current = segments[i];
    let prev = segments[i - 1];
    let dir = p5.Vector.sub(prev.pos, current.pos);
    let d = dir.mag();
    dir.setMag(0.1 * d);
    current.pos.add(dir);

    // Jitter for internal motion
    let jitter = createVector(
      (noise(t2 + current.noiseOffset) - 0.5) * random(0.2, 2),
      (noise(t2 + 100 + current.noiseOffset) - 0.5) * random(0.2, 2),
    );
    current.pos.add(jitter);
  }

  // Draw from back to front
  for (let i = segments.length - 1; i >= 0; i--) {
    let s = segments[i];

    noFill();
    circle(s.pos.x, s.pos.y, s.size * 2);

    for (let orbiter of s.orbiters) {
      orbiter.update(t);
      orbiter.display();
    }
  }
  
  let proximityThreshold = 100; // pixels
  let nearCreature = false;

  for (let s of segments) {
    let d = dist(player.x, player.y, s.pos.x, s.pos.y);
    if (d < proximityThreshold) {
      nearCreature = true;
      break;
    }
  }

  // If near and timer is off, pick a new message
  if (nearCreature && creatureMessageTimer === 0) {
    currentCreatureMessage = random(creatureMessages);
    creatureMessageTimer = creatureMessageDuration;
  }

  // Countdown and display message
  if (creatureMessageTimer > 0) {
    creatureMessageTimer--;
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(textsize);
    text(currentCreatureMessage, player.x, player.y - player.radius - 50);
  }


  
  fill('#4E4F22');
  beginShape();
  vertex(0, height*0.3);
  let steps2 = 30;
  for (let i = 0; i <= steps2; i++) {
    let t = i / steps;
    let x = lerp(0, width*0.5, t);
    let y = lerp(height*0.3, 0, t);  
  // Apply vertical noise displacement
  let yOffset = map(noise(t * 2, 5), 0, 1, -200, 200);
  vertex(x, y + yOffset);
}
  vertex(width*0.5, 0);
  vertex(0, 0)
  endShape(CLOSE);

  beginShape();
  vertex(width*0.7, 0);
  for (let i = 0; i <= steps2; i++) {
    let t = i / steps;
    let x = lerp(width*0.7, width, t);
    let y = lerp(0, height*0.15, t);  
  // Apply vertical noise displacement
  let yOffset = map(noise(t * 2, 5), 0, 1, -100, 100);
  vertex(x, y + yOffset);
}
  vertex(width, height*0.15);
  vertex(width, 0);
  endShape(CLOSE);

  beginShape();
  vertex(0, height*0.8);
  for (let i = 0; i <= steps2; i++) {
    let t = i / steps;
    let x = lerp(0, width*0.3, t);
    let y = lerp(height*0.8, height, t);  
  // Apply vertical noise displacement
  let yOffset = map(noise(t * 2, 5), 0, 1, -100, 100);
  vertex(x, y + yOffset);
}
  vertex(width*0.3, height);
  vertex(0, height);
  endShape(CLOSE);
}

function keyPressed() {
  if (key === ' ' && player.onGround) {
    player.ySpeed = -height*0.02;
  }
  if (keyCode === LEFT_ARROW) {
    player.xSpeed = -3;
  }
  if (keyCode === RIGHT_ARROW) {
    player.xSpeed = 3;
  }
}

function keyReleased() {
  if (keyCode === LEFT_ARROW || keyCode === RIGHT_ARROW) {
    player.xSpeed = 0;
  }
}

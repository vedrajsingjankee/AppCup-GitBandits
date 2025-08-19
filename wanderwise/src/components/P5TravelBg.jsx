import React, { useRef, useEffect } from "react";
import p5 from "p5";

export default function P5TravelBg() {
  const sketchRef = useRef();

  useEffect(() => {
    let myp5;
    const sketch = (p) => {
      let clouds = [];
      let birds = [];
      let boats = [];
      let weatherState = 0; // 0: sun, 1: rain, 2: rainbow, 3: night
      let weatherTimer = 0;
      let suns = [];
      let raindrops = [];
      let rainbowAlpha = 0;
      let stars = [];
      let balloons = [];
      let plane = { x: 0, y: 80, speed: 2, wing: 0 };

      p.setup = () => {
        p.createCanvas(p.windowWidth, p.windowHeight).parent(sketchRef.current);

        // Clouds
        for (let i = 0; i < 7; i++) {
          clouds.push({
            x: p.random(p.width),
            y: p.random(40, 180),
            speed: p.random(0.5, 1.2),
            size: p.random(120, 200),
          });
        }
        // Birds
        for (let i = 0; i < 7; i++) {
          birds.push({
            x: p.random(p.width),
            y: p.random(100, 320),
            speed: p.random(1.2, 2.2),
            size: p.random(22, 38),
            wing: p.random(0, p.TWO_PI),
            color: p.color(p.random(80, 255), p.random(120, 220), p.random(180, 255)),
          });
        }
        // Sun
        suns.push({
          x: p.width - 120,
          y: 100,
          r: 60,
          angle: 0,
        });
        // Boats
        for (let i = 0; i < 2; i++) {
          boats.push({
            x: p.random(p.width),
            y: p.height - 80 - i * 30,
            speed: p.random(0.6, 1.1),
            color: p.color(p.random(200, 255), p.random(100, 180), p.random(80, 120)),
            bob: p.random(0, p.TWO_PI),
          });
        }
        // Raindrops
        for (let i = 0; i < 80; i++) {
          raindrops.push({
            x: p.random(p.width),
            y: p.random(-p.height, 0),
            speed: p.random(4, 8),
            len: p.random(10, 18),
          });
        }
        // Stars
        for (let i = 0; i < 60; i++) {
          stars.push({
            x: p.random(p.width),
            y: p.random(0, p.height * 0.5),
            size: p.random(1, 3),
            tw: p.random(0, p.TWO_PI),
          });
        }
        // Balloons
        for (let i = 0; i < 4; i++) {
          balloons.push({
            x: p.random(p.width),
            y: p.random(p.height * 0.3, p.height * 0.7),
            color: p.color(p.random(200, 255), p.random(80, 180), p.random(80, 255)),
            speed: p.random(0.2, 0.5),
            bob: p.random(0, p.TWO_PI),
          });
        }
        p.noStroke();
      };

      p.windowResized = () => {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
        if (suns[0]) suns[0].x = p.width - 120;
      };

      p.draw = () => {
        // Weather state timer
        weatherTimer++;
        if (weatherState === 0 && weatherTimer > 600) { // Sun -> Rain
          weatherState = 1;
          weatherTimer = 0;
        } else if (weatherState === 1 && weatherTimer > 400) { // Rain -> Rainbow
          weatherState = 2;
          weatherTimer = 0;
        } else if (weatherState === 2 && weatherTimer > 350) { // Rainbow -> Night
          weatherState = 3;
          weatherTimer = 0;
        } else if (weatherState === 3 && weatherTimer > 400) { // Night -> Sun
          weatherState = 0;
          weatherTimer = 0;
        }

        // Background
        if (weatherState === 3) {
          // Night
          p.background(20, 30, 60, 255);
        } else {
          // Day
          p.background(180, 230, 255, 180);
        }

        // Sun (with rays)
        if (weatherState !== 3) {
          suns.forEach((s) => {
            s.angle += 0.01;
            p.push();
            p.translate(s.x, s.y);
            p.fill(255, 220, 80, 220);
            p.ellipse(0, 0, s.r * 2, s.r * 2);
            // Rays
            for (let i = 0; i < 12; i++) {
              let rayLen = 90 + 10 * Math.sin(s.angle + i);
              let angle = (p.TWO_PI / 12) * i + s.angle;
              p.fill(255, 220, 80, 80);
              p.ellipse(
                Math.cos(angle) * rayLen,
                Math.sin(angle) * rayLen,
                18,
                8
              );
            }
            p.pop();
          });
        }

        // Rainbow
        if (weatherState === 2) {
          rainbowAlpha = Math.min(rainbowAlpha + 4, 180);
          let cx = p.width / 2, cy = p.height - 60;
          let r = 320;
          let rainbowColors = [
            [255, 0, 0],
            [255, 140, 0],
            [255, 255, 0],
            [0, 255, 0],
            [0, 180, 255],
            [0, 0, 255],
            [128, 0, 128]
          ];
          for (let i = 0; i < rainbowColors.length; i++) {
            p.noFill();
            p.stroke(...rainbowColors[i], rainbowAlpha);
            p.strokeWeight(18);
            p.arc(cx, cy, r - i * 22, r - i * 22, p.PI, p.TWO_PI);
          }
          p.noStroke();
        } else {
          rainbowAlpha = 0;
        }

        // Stars (night)
        if (weatherState === 3) {
          for (let i = 0; i < stars.length; i++) {
            let s = stars[i];
            s.tw += 0.04;
            let alpha = 180 + 60 * Math.sin(s.tw);
            p.fill(255, 255, 200, alpha);
            p.ellipse(s.x, s.y, s.size, s.size);
          }
          // Draw a moon
          p.push();
          p.fill(255, 255, 200, 220);
          p.ellipse(p.width - 100, 100, 60, 60);
          p.fill(20, 30, 60, 255);
          p.ellipse(p.width - 85, 100, 40, 40);
          p.pop();
        }

        // Clouds
        clouds.forEach((c, i) => {
          c.x += c.speed;
          if (c.x > p.width + c.size) c.x = -c.size;
          p.push();
          p.fill(255, 255, 255, weatherState === 3 ? 60 : 180);
          p.ellipse(c.x, c.y, c.size, c.size * 0.6);
          p.ellipse(c.x + c.size * 0.3, c.y + 10, c.size * 0.6, c.size * 0.4);
          p.ellipse(c.x - c.size * 0.3, c.y + 12, c.size * 0.5, c.size * 0.3);
          // Add a funny face to some clouds
          if (i % 2 === 0 && weatherState !== 3) {
            p.fill(0, 0, 0, 80);
            p.ellipse(c.x - 15, c.y - 5, 10, 10);
            p.ellipse(c.x + 15, c.y - 5, 10, 10);
            p.arc(c.x, c.y + 10, 18, 10, 0, p.PI);
          }
          p.pop();
        });

        // Rain
        if (weatherState === 1) {
          for (let i = 0; i < raindrops.length; i++) {
            let r = raindrops[i];
            p.stroke(80, 180, 255, 180);
            p.strokeWeight(2);
            p.line(r.x, r.y, r.x, r.y + r.len);
            r.y += r.speed;
            if (r.y > p.height) {
              r.y = p.random(-40, 0);
              r.x = p.random(p.width);
            }
          }
          p.noStroke();
        }

        // Birds (not at night)
        if (weatherState !== 3) {
          birds.forEach((b, i) => {
            b.x += b.speed;
            if (b.x > p.width + b.size) b.x = -b.size;
            b.wing += 0.18 + 0.04 * i;
            let wingY = Math.sin(b.wing) * 10;
            // Body
            p.push();
            p.fill(b.color);
            p.ellipse(b.x, b.y, b.size, b.size * 0.7);
            // Wings (flapping)
            p.fill(255, 255, 255, 220);
            p.ellipse(b.x - b.size * 0.2, b.y + wingY, b.size * 0.8, b.size * 0.28);
            p.ellipse(b.x + b.size * 0.2, b.y - wingY, b.size * 0.8, b.size * 0.28);
            // Beak
            p.fill(255, 200, 80, 220);
            p.triangle(
              b.x + b.size * 0.4, b.y,
              b.x + b.size * 0.7, b.y - 3,
              b.x + b.size * 0.7, b.y + 3
            );
            // Sunglasses for fun
            if (i % 3 === 0) {
              p.fill(0, 0, 0, 180);
              p.rect(b.x - 6, b.y - 5, 6, 4, 1);
              p.rect(b.x + 1, b.y - 5, 6, 4, 1);
              p.rect(b.x - 1, b.y - 3, 2, 2, 1);
            }
            // Add a camera to some birds
            if (i % 4 === 0) {
              p.fill(80, 80, 80, 200);
              p.rect(b.x - 8, b.y + 8, 12, 7, 2);
              p.fill(200, 220, 255, 220);
              p.ellipse(b.x - 2, b.y + 11, 5, 5);
            }
            p.pop();
          });
        }

        // Balloons (travel/festival vibe)
        balloons.forEach((balloon, i) => {
          balloon.y -= balloon.speed;
          balloon.x += Math.sin(p.frameCount * 0.01 + i) * 0.3;
          if (balloon.y < -40) {
            balloon.y = p.height + 40;
            balloon.x = p.random(p.width);
          }
          p.push();
          p.fill(balloon.color);
          p.ellipse(balloon.x, balloon.y, 32, 40);
          p.stroke(120, 80, 80, 180);
          p.strokeWeight(2);
          p.line(balloon.x, balloon.y + 20, balloon.x, balloon.y + 50);
          p.noStroke();
          // Add a little smile
          p.fill(0, 0, 0, 80);
          p.arc(balloon.x, balloon.y + 8, 12, 8, 0, p.PI);
          p.pop();
        });

        // Plane (travel theme)
        if (weatherState !== 3) {
          plane.x += plane.speed;
          if (plane.x > p.width + 60) {
            plane.x = -60;
            plane.y = p.random(60, 180);
          }
          plane.wing += 0.15;
          p.push();
          p.translate(plane.x, plane.y);
          // Body
          p.fill(255, 255, 255, 230);
          p.rect(-20, -6, 40, 12, 6);
          // Windows
          p.fill(80, 180, 255, 200);
          for (let i = -10; i <= 10; i += 10) {
            p.ellipse(i, -2, 5, 5);
          }
          // Wings
          p.fill(200, 220, 255, 220);
          p.push();
          p.rotate(Math.sin(plane.wing) * 0.2);
          p.rect(-5, 6, 24, 5, 2);
          p.pop();
          p.push();
          p.rotate(-Math.sin(plane.wing) * 0.2);
          p.rect(-5, -11, 24, 5, 2);
          p.pop();
          // Tail
          p.fill(255, 80, 120, 220);
          p.triangle(18, -6, 28, -12, 18, 6);
          // Funny banner
          p.fill(255, 255, 200, 220);
          p.rect(-60, -4, 36, 10, 3);
          p.fill(80, 180, 255, 220);
          p.textSize(10);
          p.textAlign(p.CENTER, p.CENTER);
          p.text("Wander!", -42, 1);
          p.pop();
        }

        // Boats (bobbing)
        boats.forEach((boat, i) => {
          boat.x += boat.speed;
          if (boat.x > p.width + 60) boat.x = -60;
          boat.bob += 0.03 + 0.01 * i;
          let y = boat.y + Math.sin(boat.bob) * 8;
          p.push();
          // Hull
          p.fill(boat.color);
          p.arc(boat.x, y, 60, 30, 0, p.PI, p.CHORD);
          // Mast
          p.stroke(120, 90, 60);
          p.strokeWeight(3);
          p.line(boat.x, y - 15, boat.x, y - 45);
          // Sail
          p.noStroke();
          p.fill(255, 255, 255, 220);
          p.triangle(boat.x, y - 45, boat.x, y - 15, boat.x + 28, y - 15);
          // Funny flag
          p.fill(255, 80, 120, 200);
          p.rect(boat.x + 18, y - 45, 12, 8, 2);
          // Add a suitcase on deck for tourism
          p.fill(255, 180, 80, 220);
          p.rect(boat.x - 10, y - 20, 14, 8, 2);
          p.fill(120, 90, 60, 220);
          p.rect(boat.x - 7, y - 22, 8, 3, 1);
          p.pop();
        });

        // Water waves (bottom)
        p.push();
        for (let x = 0; x < p.width; x += 30) {
          let y = p.height - 30 + Math.sin(p.frameCount * 0.04 + x * 0.08) * 8;
          p.fill(80, 180, 255, weatherState === 3 ? 60 : 120);
          p.ellipse(x, y, 60, 18);
        }
        p.pop();
      };
    };

    myp5 = new p5(sketch);

    return () => {
      myp5.remove();
    };
  }, []);

  // The canvas is absolutely positioned and pointer-events: none so it doesn't block UI
  return (
    <div
      ref={sketchRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        width: "100vw",
        height: "100vh",
      }}
      aria-hidden="true"
    />
  );
}
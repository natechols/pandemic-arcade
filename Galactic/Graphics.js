const HELP_TEXT = "Press 'p' to resume, arrow keys to maneuver, Space bar to fire";
const Colors = {
  "PLAYER_OUTLINE": "#00ffff",
  "PLAYER_FILL": "#00a0f0",
  "PROJECTILE": ["#a0ff60", "#ffc0d0"],
  "PLUME_CENTER": "#ff8000",
  "PLUME_EDGE": "#ffe0c0",
  "ALIEN_OUTLINE": "#ffc060",
  "ALIEN_FILL": "#ff8030",
  "ALIEN_LIGHTS": ["magenta", "red", "green", "cyan"]
};

function make_polygon(n, radius) {
  return [...Array(n).keys()].map((i) => {
    const theta = Math.PI * 2 * (i / n);
    const x = Math.cos(theta) * radius;
    const y = Math.sin(theta) * radius;
    return [x, y];
  });
};

function to_grey(k) {
  return `rgba(${k}, ${k}, ${k}, 0.5)`;
};

function random_grey() {
  const k = 120 + Math.floor(Math.random()*100);
  return to_grey(k);
};

function render_space(ctx, space, w, h) {
  const imgNames = ["bennu1", "bennu2", "bennu3", "bennu4"];
  const imgs = imgNames.map((id) => document.getElementById(id));
  const asteroidPatterns = imgs.map((i) => ctx.createPattern(i, "repeat"));
  const bmpOffset = 60; // asteroid images are 120x120 pixels
  //context.fillStyle = context.createPattern(image, "repeat");
  //context.fillRect(0, 0, 300, 300);

  function render_ship(ship) {
    const xy = ship.position;
    const angle = ship.angle_pointed;
    ctx.save();
    ctx.translate(xy.x, xy.y);
    ctx.rotate(angle);
    const length = ship.radius * 2;
    if (ship.accel != 0 && !ship.is_destroyed) {
      const grad = ctx.createRadialGradient(-length/2, 0, length/10, -length/2, 0, length/2);
      grad.addColorStop(0, Colors.PLUME_CENTER);
      grad.addColorStop(1, Colors.PLUME_EDGE);
      ctx.fillStyle = grad;
      ctx.strokeStyle = Colors.PLUME_EDGE;
      ctx.beginPath();
      ctx.arc(-length/2, 0, length*0.33, 0, Math.PI*2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    // main body
    ctx.fillStyle = Colors.PLAYER_FILL;
    ctx.strokeStyle = Colors.PLAYER_OUTLINE;
    ctx.beginPath();
    // ship direction is the X-axis
    ctx.moveTo(-length/2, length/2);
    ctx.lineTo(length/2, 0);
    ctx.lineTo(-length/2, -length/2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.lineWidth = 1;
    const fins = [
      [[-length / 2, length / 4], [0, length / 4]],
      [[-length / 2, 0], [0, 0]],
      [[-length / 2, -length  /4], [0, -length  / 4]]
    ];
    fins.forEach((fin) => {
      ctx.beginPath();
      ctx.strokeStyle = Colors.PLAYER_OUTLINE;
      ctx.moveTo(fin[0][0], fin[0][1]);
      ctx.lineTo(fin[1][0], fin[1][1]);
      ctx.closePath();
      ctx.stroke();
    });
    ctx.restore();
  };

  function render_alien(ship) {
    const xy = ship.position;
    const r = ship.radius;
    const angle = ship.angle_pointed;
    ctx.save();
    ctx.translate(xy.x, xy.y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.strokeStyle = Colors.ALIEN_OUTLINE;
    ctx.fillStyle = Colors.ALIEN_FILL;
    ctx.arc(0, 0, r, 0, 2*Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, r/3, 0, 2*Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    for (let i = 0; i < Colors.ALIEN_LIGHTS.length; i++) {
      const theta = Math.PI*2*(i / Colors.ALIEN_LIGHTS.length);
      const lightX = Math.cos(theta) * r * 0.67;
      const lightY = Math.sin(theta) * r * 0.67;
      ctx.save();
      ctx.beginPath();
      ctx.strokeStyle = Colors.ALIEN_OUTLINE;
      ctx.fillStyle = Colors.ALIEN_LIGHTS[i];
      ctx.arc(lightX, lightY, 3, 0, 2*Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  };

  function render_projectile(p) {
    const xy = p.position;
    ctx.save();
    ctx.fillStyle = Colors.PROJECTILE[p.type];
    ctx.strokeStyle = ctx.fillStyle;
    //ctx.rotate(p.angle);
    ctx.beginPath();
    //ctx.moveTo(xy.x - 2, xy.y);
    //ctx.lineTo(xy.x + 2, xy.y);
    ctx.arc(xy.x, xy.y, p.radius/2, 0, 2*Math.PI);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  function render_asteroid(a) {
    ctx.save();
    const xy = a.position;
    const r = a.radius;
    ctx.lineWidth = 0;
    //ctx.strokeStyle = "#a0a0a0";
    //ctx.fillStyle = "#a0a0a0";
    const k = Math.min(200, 150 + Math.floor(1000*a.radial_velocity));
    ctx.strokeStyle = `rgb(${k}, ${k}, ${k})`;
    const asteroidPattern = asteroidPatterns[a.sides % 4];
    ctx.fillStyle = asteroidPattern; //tx.strokeStyle;
    const renderAt = [[xy.x, xy.y]];
    if (xy.x - r < 0) {
      renderAt.push([xy.x + w, xy.y]);
    } else if (xy.x + r > w) {
      renderAt.push([xy.x - w, xy.y]);
    }
    if (xy.y - r < 0) {
      renderAt.push([xy.x, xy.y + h]);
    } else if (xy.y + r > h) {
      renderAt.push([xy.x, xy.y - h]);
    }
    renderAt.forEach((xy) => {
      ctx.save();
      ctx.translate(xy[0], xy[1]);
      ctx.rotate(a.angle);
      ctx.save();
      ctx.translate(-bmpOffset, -bmpOffset);
      ctx.beginPath();
      const vertices = make_polygon(a.sides, r);
      ctx.moveTo(vertices[0][0] + bmpOffset, vertices[0][1] + bmpOffset);
      for (let i = 1; i < vertices.length; i++) {
        ctx.lineTo(vertices[i][0] + bmpOffset, vertices[i][1] + bmpOffset);
      };
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.restore();
    });
    ctx.restore();
  };

  function render_debris_fragment(f, color, edgeColor) {
    const xy = f.position;
    ctx.save();
    ctx.translate(xy.x, xy.y);
    ctx.rotate(f.angle);
    ctx.fillStyle = color;
    ctx.strokeStyle = (edgeColor !== undefined) ? edgeColor : color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-f.radius, 0);
    ctx.lineTo(f.radius, 0);
    ctx.lineTo(0, f.radius);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  };

  for (let i = 0; i < space.debris.length; i++) {
    const fragment = space.debris[i];
    const shade = 120 + 100 * (i / space.debris.length);
    render_debris_fragment(fragment, to_grey(shade));
  }
  if (space.player.is_destroyed) {
    space.player.debris.forEach((f) => {
      render_debris_fragment(f, Colors.PLAYER_FILL, Colors.PLAYER_OUTLINE);
    });
  } else {
    render_ship(space.player);
  }
  space.projectiles.forEach((p) => render_projectile(p));
  space.rocks.forEach((r) => render_asteroid(r));
  space.enemies.forEach((e) => {
    if (e.is_destroyed) {
      e.debris.forEach((f) =>
        render_debris_fragment(f, Colors.ALIEN_FILL, Colors.ALIEN_OUTLINE));
    } else {
      render_alien(e);
    }
  });
};

function render_game(game, canvas) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;

  function render_credits() {
    ctx.save();
    ctx.font = "12pt Monaco";
    ctx.fillStyle = "rgba(150, 255, 100, 0.5)";
    ctx.textAlign = "right";
    ctx.fillText("Photo credits: ESA/Hubble", w - 5, h - 10);
    ctx.stroke();
    ctx.restore();
  };

  function render_status() {
    ctx.save();
    ctx.font = "12pt Monaco";
    ctx.fillStyle = "#80ff30";
    ctx.textAlign = "left";
    ctx.beginPath();
    ctx.fillText(`Level: ${game.level+1}`, 5, canvas.height - 10);
    ctx.stroke();
    ctx.fillStyle = "#60c0ff";
    ctx.textAlign = "center";
    ctx.fillText(`Ships: ${game.ships}`, w / 2, h - 10);
    ctx.stroke();

    function main_status(msg, color) {
      ctx.beginPath();
      ctx.font = "36pt Monaco";
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.fillText(msg, w / 2, h / 2);
      ctx.stroke();
    };

    if (game.state === "READY" || game.state === "PAUSED") {
      main_status(game.state, "#ffff00");
      ctx.beginPath();
      ctx.font = "18pt Monaco";
      ctx.fillText(HELP_TEXT, w / 2, 100 + h / 2);
      ctx.stroke();
    } else if (game.state === "OVER") {
      main_status("GAME OVER", "#ff0000");
    } else if (game.state === "WON") {
      main_status("WINNER!", "#00ff00");
    }
    ctx.restore();
  };

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.closePath();
  ctx.stroke();
  render_credits();
  ctx.save();
  ctx.translate(0, canvas.height);
  ctx.scale(1, -1);
  render_space(ctx, game.current_space, w, h);
  ctx.restore();
  ctx.save();
  render_status();
  ctx.restore();
};

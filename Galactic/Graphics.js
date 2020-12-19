function render_space(ctx, space, w, h) {

  function render_ship(ship) {
    const xy = ship.position;
    const angle = ship.angle_pointed;
//   const c3 = xy.plus_xy(15, 0).rotate_around(xy, angle);
    //console.log(c1);
    ctx.save();
    ctx.translate(xy.x, xy.y);
    //ctx.scale(2, 2);
    ctx.rotate(angle);
    const length = ship.radius * 2;
    if (ship.accel != 0 && !ship.is_destroyed) {
      const grad = ctx.createRadialGradient(-length/2, 0, length/10, -length/2, 0, length/2);
      grad.addColorStop(0, "#ff8000");
      grad.addColorStop(1, "#ffe0c0");
      ctx.fillStyle = grad;
      ctx.strokeStyle = "#ffe0c0";
      ctx.beginPath();
      ctx.arc(-length/2, 0, length*0.33, 0, Math.PI*2);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
    // main body
    let borderColor = "#00ffff";
    let fillColor = "#00a0f0";
    if (ship.is_destroyed) {
      borderColor = "#ffa030";
      fillColor = "#ff8030";
    }
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = borderColor;
    ctx.beginPath();
    // ship direction is the X-axis
    ctx.moveTo(-length/2, length/2);
    ctx.lineTo(length/2, 0);
    ctx.lineTo(-length/2, -length/2);
    ctx.closePath();
    //ctx.fillStyle = "#00ffff"; //IFF_COLORS[o.get_iff_status()];
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
      ctx.strokeStyle = borderColor; // IFF_COLORS[o.get_iff_status()];
      ctx.moveTo(fin[0][0], fin[0][1]);
      ctx.lineTo(fin[1][0], fin[1][1]);
      ctx.closePath();
      ctx.stroke();
    });
    ctx.restore();
  };

  function render_projectile(p) {
    const xy = p.position;
    ctx.save();
    ctx.fillStyle = "#a0ff60";
    ctx.strokeStyle = "#a0ff60";
    //ctx.rotate(p.angle);
    ctx.beginPath();
    //ctx.moveTo(xy.x - 2, xy.y);
    //ctx.lineTo(xy.x + 2, xy.y);
    ctx.arc(xy.x, xy.y, 2, 2*Math.PI, false);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();
  };

  function render_asteroid(a) {
    ctx.save();
    const xy = a.position;
    ctx.lineWidth = 0;
    ctx.strokeStyle = "#a0a0a0";
    ctx.fillStyle = "#a0a0a0";
    const renderAt = [[xy.x, xy.y]];
    if (xy.x - a.radius < 0) {
      renderAt.push([xy.x + w, xy.y]);
    } else if (xy.x + a.radius > w) {
      renderAt.push([xy.x - w, xy.y]);
    }
    if (xy.y - a.radius < 0) {
      renderAt.push([xy.x, xy.y + h]);
    } else if (xy.y + a.radius > h) {
      renderAt.push([xy.x, xy.y - h]);
    }
    renderAt.forEach((xy) => {
      ctx.beginPath();
      ctx.arc(xy[0], xy[1], a.radius, 0, 2*Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
    ctx.restore();
  };

  function render_debris_fragment(f, color) {
    console.log("frag");
    const xy = f.position;
    ctx.save();
    ctx.translate(xy.x, xy.y);
    ctx.rotate(f.angle);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-f.radius, 0);
    ctx.lineTo(f.radius, 0);
    //ctx.lineTo(0, f.radius);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
    ctx.restore();
    console.log(xy.x, xy.y);
  };

  space.debris.forEach((f) => render_debris_fragment(f, "rgba(180,180,180,0.5)"));
  render_ship(space.ship);
  space.projectiles.forEach((p) => render_projectile(p));
  space.rocks.forEach((r) => render_asteroid(r));
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
    ctx.fillText(`Level: ${game.level}`, 5, canvas.height - 10);
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
      ctx.fillText("Press 'p' to resume", w / 2, 100 + h / 2);
      ctx.stroke();
    } else if (game.state === "OVER") {
      main_status("GAME OVER", "#ff0000");
    } else if (game.state === "WON") {
      main_status("WINNER!", "#00ff00");
    }
    ctx.restore();
  };

  ctx.clearRect(0, 0, canvas.width, canvas.height);
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

/** this code is in the public domain
  * but you definitely get what you pay for
  * natechols
  * changelog:
  *   2020-12-16 playable single-level version
  *   2020-12-17 multiple levels
  */

function start_game(levels) {
// this is arbitrarily scaled
const TIME_FACTOR = 10;
const MAX_VELOCITY = 16;
const INITIAL_VELOCITY = 4;
const BORDER = 10;
const BOTTOM = 100;
const BRICK_BORDER = 2;
const WIDTH = 1600;
const MIDPOINT = 800;
const HEIGHT = 1000;
const PADDLE_RAISE = 10;
const PADDLE_HEIGHT = 5;
const PADDLE_BOTTOM = BOTTOM + PADDLE_RAISE;
const MAX_X = WIDTH - BORDER;
const MIN_X = BORDER;
const MAX_Y = HEIGHT - BORDER;

const WALLS = [
  [[BORDER, HEIGHT - BORDER], [WIDTH - BORDER, HEIGHT - BORDER]],
  [[BORDER, HEIGHT - BORDER], [BORDER, BOTTOM]],
//  [[BORDER, BOTTOM], [BORDER, HEIGHT - BORDER]],
  [[WIDTH - BORDER, BOTTOM], [WIDTH - BORDER, HEIGHT - BORDER]]
//  [[400, 500], [1200, 500]]
];
const BOTTOM_ZONE = [[BORDER, BOTTOM], [WIDTH - BORDER, BOTTOM]];

function draw(game, gameOver) {
  const PADDLE_COLOR = "#ffffff";
  const BALL_COLOR = "#e0e0e0";
  const WALL_COLOR = "#ffffff";
  const BOTTOM_COLOR = "#ff0000";

  const state = game.state;
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");

  function draw_brick(brick, color, is_solid) {
    ctx.beginPath();
    if (is_solid) {
      ctx.fillStyle = color;
    } else {
      ctx.strokeStyle = color;
    }
    //console.log(level.brick_colors[i]);
    const x = brick[0] + BRICK_BORDER;
    const y = brick[1] + BRICK_BORDER;
    const w = brick[2] - BRICK_BORDER*2;
    const h = brick[3] - BRICK_BORDER*2;
    if (is_solid) {
      ctx.fillRect(x, y, w, h); //brick[0], brick[1], brick[2], brick[3]);
    } else {
      ctx.strokeRect(x, y, w, h);
    }
    ctx.stroke();
  };

  function draw_bricks() {
    const level = state.level;
    ctx.lineWidth = 1;
    for (let i = 0; i < state.bricks.length; i++) {
      const is_solid = state.bricks[i] === true;
      const is_hit = state.brick_lifetimes[i] > 0;
      if (is_solid || is_hit) {
        const brick = state.level.bricks[i];
        draw_brick(brick, level.brick_colors[i], is_solid);
        if (is_hit) {
          state.brick_lifetimes[i]--;
        }
      }
    }
  };

  function draw_walls() {
    ctx.strokeStyle = WALL_COLOR;
    ctx.lineWidth = 4;
    for (let i = 0; i < WALLS.length; i++) {
      const edge = WALLS[i];
      ctx.beginPath();
      ctx.moveTo(edge[0][0], edge[0][1]);
      ctx.lineTo(edge[1][0], edge[1][1]);
      ctx.stroke();
    }
  };

  function draw_bottom() {
    ctx.strokeStyle = BOTTOM_COLOR;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(BOTTOM_ZONE[0][0], BOTTOM_ZONE[0][1]);
    ctx.lineTo(BOTTOM_ZONE[1][0], BOTTOM_ZONE[1][1]);
    ctx.stroke();
  };

  function draw_paddle() {
    const x_center = state.paddle_x;
    const paddle_width = state.level.paddle_width; // fractional
    ctx.beginPath();
    ctx.strokeStyle = PADDLE_COLOR;
    ctx.fillStyle = PADDLE_COLOR;
    const half_width = (paddle_width * (WIDTH - BORDER*2)) / 2;
    const x1 = x_center - half_width;
    const y1 = PADDLE_BOTTOM - PADDLE_HEIGHT;
    ctx.fillRect(x1, y1, half_width * 2, PADDLE_HEIGHT) //y2);
    ctx.stroke();
  };

  function draw_ball() {
    const x = state.ball_x;
    const y = state.ball_y;
    const radius = state.level.ball_radius;
    ctx.beginPath();
    const grd = ctx.createRadialGradient(x, y, 1, x, y, radius);
    grd.addColorStop(0, "#c0ff80");
    grd.addColorStop(1, "#60ff80");
    ctx.fillStyle = grd; //BALL_COLOR;
    ctx.arc(x, y, radius, 0, Math.PI*2);
    ctx.fill();
  };

  // this takes place in a transform that inverts the Y-axis
  function draw_arena() {
    draw_bottom();
    draw_walls();
    draw_paddle();
    draw_ball();
    draw_bricks();
  };

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(0, canvas.height);
  ctx.scale(1, -1);
  ctx.lineCap = "square";
  draw_arena(ctx, game.state, game.paused, gameOver);
  ctx.restore();
  draw_status();

  function draw_status() {
    const textY = HEIGHT - 60;
    if (gameOver === true) {
      ctx.textAlign = "center";
      ctx.fillStyle = "#ff0000";
      ctx.beginPath();
      ctx.font = "20pt Monaco";
      ctx.fillText("GAME OVER", WIDTH / 2, textY);
      ctx.stroke();
    } else if (game.paused === true || game.ready === true) {
      ctx.textAlign = "center";
      ctx.fillStyle = "#ffff00";
      ctx.beginPath();
      ctx.font = "20pt Monaco";
      const gameText = (game.paused === true) ? "PAUSED" : "READY - press Space to resume";
      ctx.fillText(gameText, WIDTH / 2, textY);
      ctx.stroke();
    }
    //ctx.textBaseline
    ctx.fillStyle = "#60ff60";
    ctx.font = "16pt Monaco";
    ctx.beginPath();
    ctx.textAlign = "left";
    const totalScore = game.score + game.state.current_score;
    const maxScore = Math.max(game.maxScore, totalScore);
    ctx.fillText(`Score: ${totalScore}  High Score: ${maxScore}`,
                 BORDER, textY);
    ctx.stroke();
    ctx.beginPath();
    ctx.textAlign = "right";
    const levelId = game.level_id + 1;
    ctx.fillText(`Level: ${levelId}  Balls: ${game.balls}`,
                 WIDTH - BORDER, textY);
    ctx.stroke();
  };

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.translate(0, canvas.height);
  ctx.scale(1, -1);
  ctx.lineCap = "square";
  draw_arena(ctx, game.state, game.paused, gameOver);
  ctx.restore();
  draw_status();
};

function get_paddle_edges(state) {
  const half_width = (state.level.paddle_width * (WIDTH - BORDER*2)) / 2;
  const x1 = state.paddle_x - half_width;
  const x2 = state.paddle_x + half_width;
  const y1 = PADDLE_BOTTOM - PADDLE_HEIGHT;
  return [
    [[x1, y1], [x2, y1]]//,
//    [[x1, y1], [x1, PADDLE_BOTTOM]],
//    [[x2, y1], [x2, PADDLE_BOTTOM]]
  ];
};

// for logging only!
function degrees(rad) {
  return Math.round(180 * rad / Math.PI);
};

function get_vector_length(x, y) {
  return Math.sqrt(x*x + y*y);
};

function get_line_length(xy1, xy2) {
  return get_vector_length(xy2[0] - xy1[0], xy2[1] - xy1[1]);
};

function get_vector_abc(x1, y1, x2, y2) {
  const A = y2 - y1;
  const B = x1 - x2;
  const C = A * x1 + B * y1;
  return [A, B, C];
};

function get_velocity(state) {
  return get_vector_length(state.ball_vector_x, state.ball_vector_y);
};

function distance_to_edge(state, edge) {
  const x0 = state.ball_x;
  const y0 = state.ball_y;
  const x1 = edge[0][0];
  const x2 = edge[1][0];
  const y1 = edge[0][1];
  const y2 = edge[1][1];
  return (Math.abs((x2 - x1)*(y1 - y0) - (x1 - x0)*(y2 - y1)) /
          Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)));
};

function is_in_range(state, edge) {
  const radius = state.level.ball_radius;
  const velocity = get_velocity(state);
  const x1 = edge[0][0];
  const x2 = edge[1][0];
  const y1 = edge[0][1];
  const y2 = edge[1][1];
  const dist = Math.abs((x2 - x1)*(y1 - state.ball_y) - (x1 - state.ball_x)*(y2 - y1)) / Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  return dist <= radius + velocity;
};

function get_slope_angle(xy1, xy2) {
  return Math.atan2(xy2[1] - xy1[1], xy2[0] - xy1[0]); // y first!
};

// FIXME this is horrific
function get_intersection(state, edge) {
  const radius = state.level.ball_radius;
  const xy1 = [state.ball_x, state.ball_y];
  const xy2 = [state.ball_x + state.ball_vector_x,
               state.ball_y + state.ball_vector_y];
  const xy3 = edge[0];
  const xy4 = edge[1];
  const ABC1 = get_vector_abc(xy1[0], xy1[1], xy2[0], xy2[1]);
  const ABC2 = get_vector_abc(xy3[0], xy3[1], xy4[0], xy4[1]);
  const A1 = ABC1[0];
  const B1 = ABC1[1];
  const C1 = ABC1[2];
  const A2 = ABC2[0];
  const B2 = ABC2[1];
  const C2 = ABC2[2];
  const det = A1*B2 - A2*B1;
  if (det !== 0){
    const x = (B2*C1 - B1*C2)/det;
    const y = (A1*C2 - A2*C1)/det;
    const isIntersect = (x >= Math.min(xy3[0], xy4[0]) - 1 &&
                         x <= Math.max(xy3[0], xy4[0]) + 1 &&
                         y >= Math.min(xy3[1], xy4[1]) - 1 &&
                         y <= Math.max(xy3[1], xy4[1]) + 1);
    if (isIntersect) {
      const dxy1 = get_line_length(xy1, [x, y]);
      const dxy2 = get_line_length(xy2, [x, y]);
      if (dxy2 < dxy1) {
        return {"xy": [x, y], "distance": dxy1};
      }
    }
  }
  return null;
};

// FIXME too much math here, it's simpler than this
function get_reflected_angle(theta_edge, theta_ball) {
  const dtheta = (Math.PI + theta_ball) - theta_edge;
  const new_theta = Math.PI - dtheta;
  //const new_theta_abs = theta_edge + new_theta;
  const new_theta_abs = theta_edge + (Math.PI - ((Math.PI + theta_ball) - theta_edge))
  /*
  console.log("theta_ball:", degrees(theta_ball),
              "theta_edge:", degrees(theta_edge),
              "dtheta:", degrees(dtheta),
              "new_theta:", degrees(new_theta),
              "abs(new_theta):", degrees(new_theta_abs));
  */
  return new_theta_abs;
};

function compute_bounce_vector(state, xy_start, edge, intersect, velocity) {
  console.log("BOUNCE");
  console.log("pos:", xy_start); //state.ball_x, state.ball_y);
  const xy_edge = edge[0];
  const theta_ball = get_slope_angle(xy_start, intersect);
  const theta_edge = get_slope_angle(xy_edge, intersect);
  const new_theta = get_reflected_angle(theta_edge, theta_ball);
  const vlen = get_vector_length(state.ball_vector_x, state.ball_vector_y);
  let dx = Math.cos(new_theta) * vlen;
  let dy = Math.sin(new_theta) * vlen;
  // FIXME this needs to be angle-constrained, instead of letting the ball
  // completely reverse course
  if (velocity !== undefined) {
    const velScaled = (velocity !== 0) ? Math.sqrt(Math.abs(velocity)) : 0;
    dx += (velocity >= 0) ? velScaled : -velScaled;
  }
  dx = (dx >= 0) ? Math.min(dx, MAX_VELOCITY) : Math.max(dx, -MAX_VELOCITY);
  const dy_scaled = Math.abs(dx*Math.tan(0.1744));
  dy = (dy < 0) ? Math.min(dy, -dy_scaled) : Math.max(dy, dy_scaled);
  state.ball_vector_x = dx;
  state.ball_vector_y = dy;
  console.log("vec:", state.ball_vector_x, state.ball_vector_y);
};

function detect_edge_collision(state, edge) {
  const distance = distance_to_edge(state, edge);
  const radius = state.level.ball_radius;
  const velocity = get_velocity(state);
  const inRange = distance <= radius + velocity;
  if (inRange) {
    const intersection = get_intersection(state, edge);
    if (intersection != null) {
      return {
        "edge": edge,
        "xy": intersection.xy,
        "distance": distance,
        "brick_idx": null, // booo
        "is_paddle": false
      }
      //compute_bounce_vector(state, edge, xy, velocity);
      //return true;
    }
  }
  return null;
};

function detect_brick_collision(state, brick_idx) {
  const brick = state.level.bricks[brick_idx];
  const x1 = brick[0];
  const y1 = brick[1];
  const x2 = x1 + brick[2];
  const y2 = y1 + brick[3];
  // crude optimization
  if (state.ball_x < x1 - 50 || state.ball_x > x2 + 50 ||
      state.ball_y < y1 - 50 || state.ball_y > y2 + 50) {
    return [];
  }
  const edges = [
    [[x1, y1], [x2, y1]],
    [[x1, y2], [x2, y2]],
    [[x1, y1], [x1, y2]],
    [[x2, y1], [x2, y2]]
  ];
  const collisions = [];
  for (let i = 0; i < edges.length; i++) {
    const coll = detect_edge_collision(state, edges[i]);
    if (coll !== null) {
      coll.brick_idx = brick_idx;
      collisions.push(coll);
    }
  }
  return collisions;
};

function collect_brick(state, brick_idx) {
  //console.log("POP:", brick_idx);
  state.bricks[brick_idx] = false;
  state.brick_lifetimes[brick_idx] = 20;
  state.current_score += state.current_run + 1;
  state.current_run++;
  state.bricks_remaining--;
};

function get_collisions(state) {
  const collisions = [];
  const paddle = get_paddle_edges(state);
  for (let i = 0; i < 1; i++) {
    const coll = detect_edge_collision(state, paddle[i]);
    if (coll !== null) {
      coll.is_paddle = true;
      collisions.push(coll);
    }
  }
  for (let i = 0; i < WALLS.length; i++) {
    const coll = detect_edge_collision(state, WALLS[i]);
    if (coll !== null) {
      collisions.push(coll);
    }
  }
  for (let i = 0; i < state.level.bricks.length; i++) {
    if (state.bricks[i] === true) {
      const brickCollisions = detect_brick_collision(state, i);
      collisions.push.apply(collisions, brickCollisions);
    }
  }
  return collisions;
};

function update_state(state, dt) {
  const radius = state.level.ball_radius;
  const velocity = get_velocity(state);
  if (state.ball_y < BOTTOM + radius - 2) {
    state.failed = true;
    return false;
  } else if (state.ball_x > MAX_X || state.ball_x < MIN_X) {
    console.log("ERROR");
    console.log(state);
    if (state.ball_x > MAX_X) {
      state.ball_x = MAX_X - state.level.ball_radius - 2;
    } else {
      state.ball_x = MIN_X + state.level.ball_radius + 2;
    }
  }
  function step(delta) {
    state.ball_x += state.ball_vector_x * delta;
    state.ball_y += state.ball_vector_y * delta;
  };
  let deltaCurrent = dt / TIME_FACTOR;
  const dxyzStep = deltaCurrent * velocity;
  collisions = get_collisions(state);
  let scored = false;
  if (collisions.length > 0) {
    const closest = collisions.sort((a, b) => a.distance - b.distance)[0];
    console.log(closest.distance);
    const bounceDistance = Math.min(closest.distance,
      Math.max(radius, closest.distance - radius));
    const deltaRatio = bounceDistance / dxyzStep;
    const xy_start = [state.ball_x, state.ball_y];
    //step(deltaRatio);
    //deltaCurrent -= deltaRatio;
    let edge_velocity = null;
    if (closest.is_paddle) {
      edge_velocity = state.paddle_dx;
    }
    compute_bounce_vector(state, xy_start, closest.edge, closest.xy, edge_velocity);
    if (closest.brick_idx !== null) {
      collect_brick(state, closest.brick_idx);
      scored = true;
    }
  }
  if (deltaCurrent > 0) {
    step(deltaCurrent);
  }
  return scored;
};

function on_mouse_move(state, x, y) {
  const half_width = (state.level.paddle_width * (WIDTH - BORDER*2)) / 2;
  const max_range = MIDPOINT - half_width*2;
  const dx_scaled = (MIDPOINT - x) / max_range;
  const paddle_x = x; //MIDPOINT - (dx_scaled * half_width);
  const paddle_min_x = BORDER + half_width;
  const paddle_max_x = WIDTH - BORDER - half_width;
  const old_x = state.paddle_x;
  state.paddle_x = Math.max(paddle_min_x, Math.min(paddle_x, paddle_max_x));
  // FIXME
  state.paddle_dx = (state.paddle_x - old_x) / 2;
};

function setup_events(game) {

  function onMouseOut(evt) {
    //state.paused = true;
  };

  function onMouseMove(evt) {
    if (!game.ready && !game.paused) {
      return on_mouse_move(game.state, evt.offsetX, evt.offsetY);
    }
  };

  function onKeyUp(evt) {
    switch (evt.code) {
      case "Space":
        if (game.paused === true || game.ready === true) {
          game.paused = false;
          game.ready = false;
        } else {
          game.paused = true;
        }
        break;
    }
  };
  const canvas = document.querySelector("canvas");
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mouseout", onMouseOut);
  window.addEventListener("keyup", onKeyUp);

  let gameOver = false;
  let lastTime = Date.now();
  function gameLoop () {
    const now = Date.now();
    const dt = (now - lastTime);
    lastTime = now;
    if (game.state.failed) {
      if (game.balls > 0) {
        game.balls--;
        game.state = initialize_state(levels[game.level_id]);
        game.ready = true;
      } else {
        gameOver = true;
      }
    } else if (!game.paused && !game.ready) {
      const scored = update_state(game.state, dt);
      /* XXX This is useful for debugging
      if (scored) {
        game.paused = true;
      }
      */
      if (game.state.bricks_remaining === 0) {
        next_level(game);
      }
    }
    draw(game, gameOver);
    requestAnimationFrame(gameLoop);
  };
  gameLoop();
};

function initialize_state(level) {
  const brickFlags = level.bricks.map((b) => true);
  const lifetimes = level.bricks.map((b) => 0);
  const theta = -(Math.PI / 2) + (Math.PI/8 - Math.random()*(Math.PI / 4));
  return {
    "level": level,
    "bricks": brickFlags,
    "paddle_x": WIDTH / 2,
    "ball_x": WIDTH / 2,
    "ball_y": 300,
    "ball_vector_x": INITIAL_VELOCITY * Math.cos(theta),
    "ball_vector_y": INITIAL_VELOCITY * Math.sin(theta),
    "failed": false,
    "current_score": 0,
    "current_run": 0,
    "bricks_remaining": level.bricks.length,
    "brick_lifetimes": lifetimes
  }
};

function next_level(game) {
  game.level_id++;
  game.score += game.state.current_score;
  if (game.level_id >= levels.length) {
    game.maxScore = Math.max(game.maxScore, game.score);
    reset_game(game);
  } else {
    game.state = initialize_state(levels[game.level_id]);
    game.ready = true;
  }
};

function reset_game(game) {
  game.level_id = 0;
  game.score = 0;
  game.balls = 5;
  game.state = initialize_state(levels[game.level_id]);
  game.paused = false;
  game.ready = true;
};

const newGame = {
  "level_id": 0,
  "score": 0,
  "maxScore": 0,
  "balls": 5,
  "state": null,
  "paused": false,
  "ready": false
};

reset_game(newGame);
setup_events(newGame);

};

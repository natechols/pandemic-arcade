/** this code is in the public domain
  * but you definitely get what you pay for
  * natechols
  * changelog:
  *   2020-12-16 playable single-level version
  */

function start_game(level) {
const TIMER_INTERVAL = 2; // yes this works!
const MAX_VELOCITY = 4; // calibrated to timer
const INITIAL_VELOCITY = 1;
const BORDER = 10;
const BOTTOM = 40;
const BRICK_BORDER = 2;
const WIDTH = 1600;
const HEIGHT = 900;
const PADDLE_RAISE = 10;
const PADDLE_HEIGHT = 5;
const PADDLE_COLOR = "#ffffff";
const BALL_COLOR = "#e0e0e0";
const BRICK_COLORS = ["#a0a0ff", "#ffa0a0", "#a0ffa0", "#ffa0ff"];
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
const WALL_COLOR = "#ffffff";
const BOTTOM_ZONE = [[BORDER, BOTTOM], [WIDTH - BORDER, BOTTOM]];
const BOTTOM_COLOR = "#ff0000";

function draw_bricks(ctx, state) {
  for (let i = 0; i < level.bricks.length; i++) {
    if (state.bricks[i] === true) {
      const brick = level.bricks[i];
      ctx.beginPath();
      ctx.fillStyle = state.brick_colors[i];
      const x = brick[0] + BRICK_BORDER;
      const y = brick[1] + BRICK_BORDER;
      const w = brick[2] - BRICK_BORDER*2;
      const h = brick[3] - BRICK_BORDER*2;
      ctx.fillRect(x, y, w, h); //brick[0], brick[1], brick[2], brick[3]);
      ctx.stroke();
    }
  }
};

function draw_edges(ctx) {
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

function draw_bottom(ctx) {
  ctx.strokeStyle = BOTTOM_COLOR;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(BOTTOM_ZONE[0][0], BOTTOM_ZONE[0][1]);
  ctx.lineTo(BOTTOM_ZONE[1][0], BOTTOM_ZONE[1][1]);
  ctx.stroke();
};

function draw_paddle(ctx, paddle_x, paddle_width) {
  ctx.beginPath();
  ctx.strokeStyle = PADDLE_COLOR;
  ctx.fillStyle = PADDLE_COLOR;
  const half_width = (paddle_width * (WIDTH - BORDER*2)) / 2;
  const x1 = paddle_x - half_width;
  const y1 = PADDLE_BOTTOM - PADDLE_HEIGHT;
  ctx.fillRect(x1, y1, half_width * 2, PADDLE_HEIGHT) //y2);
  ctx.stroke();
};

function draw_ball(ctx, x, y) {
  ctx.beginPath();
  const radius = level.ball_radius * WIDTH;
  const grd = ctx.createRadialGradient(x, y, 1, x, y, radius);
  grd.addColorStop(0, "#c0ff80");
  grd.addColorStop(1, "#60ff80");
  ctx.fillStyle = grd; //BALL_COLOR;
  ctx.arc(x, y, radius, 0, Math.PI*2);
  ctx.fill();
};

function draw_arena(state) {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext("2d");
  ctx.save();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.translate(0, canvas.height);
  ctx.scale(1, -1);
  ctx.lineCap = "square";
  draw_edges(ctx);
  draw_bottom(ctx);
  draw_paddle(ctx, state.paddle_x, level.paddle_width);
  draw_ball(ctx, state.ball_x, state.ball_y);
  draw_bricks(ctx, state);
  ctx.restore();
  if (state.paused) {
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffff00";
    ctx.beginPath();
    ctx.font = "36pt Gill Sans";
    ctx.fillText("PAUSED", WIDTH / 2, HEIGHT / 2);
    ctx.stroke();
  }
};

function create_state() {
  return {
    "bricks": null,
    "brick_colors": null,
    "paddle_x": WIDTH / 2,
    "paddle_dx": 0,
    "ball_x": null,
    "ball_y": null,
    "ball_vector_x": null,
    "ball_vector_y": null,
    "paused": false,
    "failed": false
  }
};

function initialize_state(state) {
  state.bricks = level.bricks.map((b) => true);
  state.brick_colors = level.bricks.map((b) => BRICK_COLORS[Math.floor(Math.random() * 4)]);
  state.paddle_x = WIDTH / 2;
  state.ball_x = state.paddle_x; //BORDER + 2 * level.ball_radius * WIDTH;
  state.ball_y = 300; //HEIGHT / 2;
  const theta = -(Math.PI / 2) + (Math.PI/8 - Math.random()*(Math.PI / 4));
  state.ball_vector_x = INITIAL_VELOCITY * Math.cos(theta);
  state.ball_vector_y = INITIAL_VELOCITY * Math.sin(theta);
  state.paused = false;
  state.failed = false;
  return state;
};

function get_paddle_edges(state) {
  const half_width = (level.paddle_width * (WIDTH - BORDER*2)) / 2;
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

function is_in_range(state, edge) {
  const radius = level.ball_radius * WIDTH;
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
  const radius = level.ball_radius * WIDTH;
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
        return [x, y];
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
  console.log("theta_ball:", degrees(theta_ball),
              "theta_edge:", degrees(theta_edge),
              "dtheta:", degrees(dtheta),
              "new_theta:", degrees(new_theta),
              "abs(new_theta):", degrees(new_theta_abs));
  return new_theta_abs;
};

function compute_bounce_vector(state, edge, intersect, velocity) {
  console.log("BOUNCE");
  console.log("pos:", state.ball_x, state.ball_y);
  const xy_ball = [state.ball_x, state.ball_y];
  const xy_edge = edge[0];
  const theta_ball = get_slope_angle(xy_ball, intersect);
  const theta_edge = get_slope_angle(xy_edge, intersect);
  const new_theta = get_reflected_angle(theta_edge, theta_ball);
  const vlen = get_vector_length(state.ball_vector_x, state.ball_vector_y);
  let dx = Math.cos(new_theta) * vlen;
  let dy = Math.sin(new_theta) * vlen;
  if (velocity !== undefined) {
    dx += velocity;
  }
  dx = Math.min(dx, MAX_VELOCITY);
  const dy_scaled = Math.abs(dx*Math.tan(0.1744));
  dy = (dy < 0) ? Math.min(dy, -dy_scaled) : Math.max(dy, dy_scaled);
  state.ball_vector_x = dx;
  state.ball_vector_y = dy;
  console.log("vec:", state.ball_vector_x, state.ball_vector_y);
};

function process_edge(state, edge, velocity) {
  if (is_in_range(state, edge)) {
    const xy = get_intersection(state, edge);
    if (xy != null) {
      compute_bounce_vector(state, edge, xy, velocity);
      return true;
    }
  }
};

function process_brick(state, brick_idx) {
  const brick = level.bricks[brick_idx];
  const x1 = brick[0];
  const y1 = brick[1];
  const x2 = x1 + brick[2];
  const y2 = y1 + brick[3];
  const edges = [
    [[x1, y1], [x2, y1]],
    [[x1, y2], [x2, y2]],
    [[x1, y1], [x1, y2]],
    [[x2, y1], [x2, y2]]
  ];
  for (let i = 0; i < edges.length; i++) {
    if (process_edge(state, edges[i])) {
      console.log("POP:", brick_idx);
      state.bricks[brick_idx] = false;
    }
  }
};

function detect_collisions(state) {
  const radius = level.ball_radius * WIDTH;
  if (state.ball_y < BOTTOM + radius - 2) {
    state.failed = true;
  } else if (state.ball_x > MAX_X || state.ball_x < MIN_X) {
    console.log("ERROR");
    console.log(state);
    state.paused = true;
  } else {
    const edges = get_paddle_edges(state);
    for (let i = 0; i < 1; i++) {
      process_edge(state, edges[i], state.paddle_dx);
    }
    for (let i = 0; i < WALLS.length; i++) {
      process_edge(state, WALLS[i]);
    }
    for (let i = 0; i < level.bricks.length; i++) {
      if (state.bricks[i] === true) {
        process_brick(state, i);
      }
    }
  }
};

function update_state(state) {
  detect_collisions(state);
  if (!state.failed && !state.paused) {
    state.ball_x += state.ball_vector_x;
    state.ball_y += state.ball_vector_y;
  }
};

function on_mouse_move(state, x, y) {
  const half_width = (level.paddle_width * (WIDTH - BORDER*2)) / 2;
  const min_x = BORDER + half_width; // + PADDLE_RAISE;
  const max_x = WIDTH - BORDER - half_width; // - PADDLE_RAISE;
  const old_x = state.paddle_x;
  state.paddle_x = Math.max(min_x, Math.min(x, max_x));
  state.paddle_dx = (state.paddle_x - old_x) / 2;
};

function setup_events(state) {

  function onMouseOut(evt) {
    state.paused = true;
  };

  function onMouseMove(evt) {
    return on_mouse_move(state, evt.offsetX, evt.offsetY);
  };

  function onTimer(evt) {
    if (state.failed) {
      initialize_state(state);
    } else if (!state.paused) {
      update_state(state);
    }
    return draw_arena(state);
  };

  function onKey(evt) {
    switch (evt.code) {
      case "Space":
        console.log("pausing");
        if (state.paused === true) {
          state.paused = false;
        } else {
          state.paused = true;
        }
        break;
    }
  };

  const canvas = document.querySelector("canvas");
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mouseout", onMouseOut);
  window.addEventListener("keypress", onKey);
  window.setInterval(onTimer, TIMER_INTERVAL);
};

const state = create_state();
initialize_state(state);
setup_events(state);
};

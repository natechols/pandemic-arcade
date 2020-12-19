/**
  * this source code is in the public domain
  */

"use strict";

const TO_DEGREES = 180 / Math.PI;
const TO_RADIANS = Math.PI / 180;
const TWO_PI = 2 * Math.PI;

function radians_to_degrees (angle) {
  return (angle * TO_DEGREES) % 360;
};

function degrees_to_radians (angle) {
  return (angle * TO_RADIANS) % TWO_PI;
};

function Point (x, y) {
  this.x = x;
  this.y = y;
};

/**
 * Here is some object-oriented code for handling the math, copied from an
 * aborted earlier project when I still thought I could write JavaScript
 * like Python.  I am not proud of this but since I already figured out the
 * math I find the style this enables easier to work with, at least in my
 * head.  Many of these methods are not used here yet but might be in a
 * more complex hypothetical future game, although they should probably be
 * replaced by a library at that point.
 */
Point.prototype = {
  constructor: Point,

  create : function (x, y) {
    return new Point(x, y);
  },

  clone : function () {
    return new Point(this.x, this.y);
  },

  move : function (dx, dy) {
    this.x += dx;
    this.y += dy;
    return this;
  },

  add : function (p) {
    this.x += p.x;
    this.y += p.y;
    return this;
  },

  subtract : function (p) {
    this.x -= p.x;
    this.y -= p.y;
    return this;
  },

  plus : function (p) {
    const p2 = this.clone();
    p2.x += p.x;
    p2.y += p.y;
    return p2;
  },

  minus : function (p) {
    const p2 = this.clone();
    p2.x -= p.x;
    p2.y -= p.y;
    return p2;
  },

  divide : function (f) {
    return this.create(this.x / f, this.y / f);
  },

  multiply : function (f) {
    return this.create(this.x * f, this.y * f);
  },

  plus_xy : function (x, y) {
    return this.plus(this.create(x,y));
  },

  minus_xy : function (x, y) {
    return this.minus(this.create(x,y));
  },

  rotate_around : function (p, angle) {
    const x = this.x;
    const y = this.y;
    this.x -= p.x;
    this.y -= p.y;
    const s = Math.sin(angle);
    const c = Math.cos(angle);
    const xnew = this.x * c - this.y * s;
    const ynew = this.x * s + this.y * c;
    this.x = xnew + p.x;
    this.y = ynew + p.y;
    return this;
  },

  angle_to : function (p) {
    return Math.atan((p.y - this.y) / (p.x - this.x));
  },

  delta_x : function (p) {
    return Math.abs(p.x - this.x);
  },

  delta_y : function (p) {
    return Math.abs(p.y - this.y);
  },

  is_in_range : function (p, max_dx, max_dy) {
    const dx = this.delta_x(p);
    const dy = this.delta_y(p);
    return ((dx <= max_dx) && (dy <= max_dy));
  },

  distance : function (p) {
    return Math.sqrt((p.x-this.x)*(p.x-this.x) + (p.y-this.y)*(p.y-this.y));
  }
};

function distance_wrapped(p1, p2, r1, r2, w, h) {
  return p1.distance(p2);
};

function Vector (x,y) {
  return Point.call(this, x, y);
};
Vector.prototype = Object.create(Point.prototype);
Vector.prototype.constructor = Vector;

Vector.from_angle = function (angle) {// = function (angle) {
  return new Vector(Math.cos(angle), Math.sin(angle));
};

Vector.prototype.create = function (x, y) {
  return new Vector(x, y);
};

Vector.prototype.clone = function () {
  return new Vector(this.x, this.y);
};

Vector.prototype.len = function () {
  return Math.sqrt(this.x*this.x + this.y*this.y);
};

Vector.prototype.scale = function (f) {
  this.x *= f;
  this.y *= f;
  return this;
};

/* return vector angle in degrees */
Vector.prototype.angle = function () {
  if (this.x < 0) {
    if (this.y < 0) {
      return Math.PI + Math.atan(this.y / this.x);
    } else {
      return Math.PI - Math.atan(this.y / this.x);
    }
  } else {
    return Math.atan(this.y / this.x);
  }
};

/* Normalize so that length is 1 */
Vector.prototype.norm = function () {
  const len = this.len();
  if (len == 0) {
    return this.clone(0,0);
  } else {
    return this.clone(this.x / len, this.y / len);
  }
};

function get_vector(angle, magnitude) {
  return new Vector(
    Math.cos(angle) * magnitude,
    Math.sin(angle) * magnitude
  );
};

/***********************************************************************/
/* Main game */

const BASE_MASS = 10;
const BASE_ACCEL = 100;
const BASE_VELOCITY = 100;
const BASE_TURN = 100;
const RELOAD_TIME = 100; // millis
const MAX_LIFETIME = 2000;
const SHARD_LIFETIME = 500;
const PROJECTILE_DISTANCE = 400;
const PROJECTILE_VELOCITY = 400;
// scales various rates versus timestep such that setting the equivalent ship
// property to '100' is approximately what the starting player ship should be.
const TURN_TIME_SCALE = 1 / 750;
const ACCEL_TIME_SCALE = 1 / 750;
const VELOCITY_TIME_SCALE = 1 / 500;

const CLOCKWISE = 1;
const COUNTERCLOCKWISE = -1;

function new_game() {
  return {
    "level": 0,
    "maxScore": 0,
    "ships": 5,
    "state": "READY",
    "current_space": null
  };
};

function get_props() {
  return {
    "accel_rate": BASE_ACCEL,
    "max_velocity": BASE_VELOCITY,
    "turn_rate": BASE_TURN
  };
};

// FIXME the way object properties are tracked is incoherent - I'm mixing
// constant and variable types in most of the models and this makes the
// interfaces difficult to maintain.  All objects should use a common base
// type that defines their motion and interaction with space.
function new_ship(x, y, type_id) {
  return {
    "properties": get_props(),
    "radius": 20,
    "position": new Point(x, y),
    "velocity": new Vector(0, 0),
    "velocity_abs": 0,
    "accel": 0,
    "turn": 0,
    "was_accelerating": 0,
    "angle_moving": 0,
    "angle_pointed": 0,
    "last_fired": 0,
    "fired_projectiles": [],
    "is_destroyed": false,
    "lifetime": MAX_LIFETIME,
    "debris": [],
    "shields": 0, // TODO
    "type": (type_id === undefined) ? 0 : type_id
  };
};

function new_space(width, height) {
  return {
    "width": width,
    "height": height,
    "player": null,
    "rocks": [],
    "enemies": [],
    "others": [],
    "projectiles": [],
    "debris": [],
    "lifetime": MAX_LIFETIME
  };
};

function space_cleared(space) {
  return (space.player.is_destroyed === false &&
          space.rocks.length === 0 &&
          space.enemies.length === 0 &&
          space.others.length === 0);
};

function get_projectile_props(type_id) {
  const i = (type_id === undefined) ? 0 : type_id;
  return {
    "distance_max": PROJECTILE_DISTANCE,
    "velocity": PROJECTILE_VELOCITY
  };
};

function make_fragment(object) {
  const angle = Math.random() * Math.PI * 2;
  const delta = Vector.from_angle(angle).scale(Math.random() * object.radius);
  const velocityNew = object.velocity.clone().add(delta.scale(Math.random()*4));
  return {
    "angle": angle,
    "radius": Math.max(2, object.radius / 4),
    "position": object.position.clone().add(delta),
    "velocity": velocityNew,
    "velocity_abs": velocityNew.len(),
    "lifetime": SHARD_LIFETIME,
    "radial_velocity": 0.1 * (0.5 - Math.random()),
    "is_destroyed": false
  };
};

function make_debris(object, nFragments) {
  return [...Array(nFragments)].map(() => make_fragment(object));
};

function new_projectile(position, angle, type_id) {
  const props = get_projectile_props(type_id);
  return {
    "properties": props,
    "position": position.clone(),
    "radius": 5,
    "angle": angle,
    "velocity": props.velocity,
    "distance_traveled": 0,
    "is_destroyed": false,
    "type": (type_id === undefined) ? 0 : type_id
  };
};

function new_asteroid(position, velocity, radius, nFrag) {
  return {
    "radius": radius,
    "position": position,
    "velocity": velocity,
    "velocity_abs": velocity.len(),
    "is_destroyed": false,
    "angle": 0,
    "radial_velocity": 0.05 * (0.5 - Math.random()),
    "sides": Math.floor(Math.max(8, Math.random()*20)),
    "nFrag": (nFrag === undefined) ? 2 : nFrag
  };
};

function new_asteroid_at(a, iAngle) {
  const theta = a.velocity.angle();
  const dtheta = Math.random() * (Math.PI / 2);
  const angle = (iAngle % 2 === 0) ? theta + dtheta : theta - dtheta;
  const direction = new Vector(Math.cos(angle), Math.sin(angle));
  const velocity = 100;
  return new_asteroid(a.position.clone(),
                      direction.scale(velocity),
                      a.radius / 2,
                      a.nFrag);
};

function explode_asteroid(a) {
  const newRocks = [];
  if (a.radius >= 20) {
    for (let i = 0; i < a.nFrag; i++) {
      newRocks.push(new_asteroid_at(a, i));
    }
  }
  return {
    "rocks": newRocks,
    "debris": make_debris(a, 10)
  };
};

function new_random_asteroid(w, h, ship, nFrag) {
  const angle = Math.random() * (Math.PI * 2);
  const direction = new Vector(Math.cos(angle), Math.sin(angle));
  let pos = new Point(Math.random() * w, Math.random() * h);
  // this avoids crashing into the ship immediately
  while (pos.distance(ship.position) < 400) {
    pos = new Point(Math.random() * w, Math.random() * h);
  }
  const velocity = 100;
  return new_asteroid(pos, direction.scale(velocity), 50, nFrag);
};

function new_random_enemy(w, h, player, type_id) {
  const angle = Math.random() * (Math.PI * 2);
  const direction = new Vector(Math.cos(angle), Math.sin(angle));
  // enemies always arrive from the top of the screen
  let pos = new Point(Math.random() * w, h); //Math.random() * h);
  // this avoids crashing into the player immediately
  while (pos.distance(player.position) < 400) {
    pos = new Point(Math.random() * w, Math.random() * h);
  }
  const ship = new_ship(pos.x, pos.y, type_id);
  const vabs = 100;
  ship.velocity = direction.scale(vabs);
  ship.velocity_abs = vabs
  return ship;
};

function accelerate(ship, x) {
  if (ship.accel < ship.properties.accel_rate) {
    ship.accel = ship.properties.accel_rate;
    ship.was_accelerating = true;
  }
  // new velocity will be computed in update_ship()
};

function turn(ship, direction) {
  ship.turn = direction;
};

function reverse_course(ship) {
  const target = (ship.direction_moving + Math.PI) % TWO_PI;
  const dt = ship.direction_pointed - target;
  if (dt > 0.005) {
    turn(ship, COUNTERCLOCKWISE);
  } else if (dt < 0.005) {
    turn(ship, CLOCKWISE);
  }
};

function get_ship_front(ship) {
  return new Point(
    ship.position.x + Math.cos(ship.angle_pointed) * ship.radius,
    ship.position.y + Math.sin(ship.angle_pointed) * ship.radius
  );
};

function fire_weapon(ship) {
  const now = Date.now();
  const dt = now - ship.last_fired;
  if (dt > RELOAD_TIME) {
    const xy = get_ship_front(ship);
    const p = new_projectile(xy, ship.angle_pointed, ship.type);
    ship.fired_projectiles.push(p);
    ship.last_fired = now;
  }
};

function transfer_momentum(fromObj, toObj) {
  toObj.velocity.add(fromObj.velocity.clone());
  toObj.velocity_abs = toObj.velocity.len();
};

function update(space, t) {
  const player = space.player

  function update_position(object) {
    if (object.velocity_abs != 0) {
      const d = object.velocity.multiply(t * VELOCITY_TIME_SCALE);
      object.position.move(d.x, d.y);
      wrap_position(object);
    }
  };

  function wrap_position(object) {
    if (object.position.x < 0) {
      object.position.x = space.width + object.position.x;
    } else if (object.position.x > space.width) {
      object.position.x = object.position.x - space.width;
    }
    if (object.position.y < 0) {
      object.position.y = space.height + object.position.y;
    } else if (object.position.y > space.height) {
      object.position.y = object.position.y - space.height;
    }
  };

  function detect_collision(o1, o2) {
    const dxy = distance_wrapped(o1.position, o2.position,
                                 o1.radius, o2.radius,
                                 space.width, space.height);
    const contactDist = o1.radius + o2.radius - 2;
    if (dxy < contactDist) {
      return dxy;
    }
    return null;
  };

  function detect_projectile_collisions(p, objects, callback) {
    let nearest = null;
    let minDist = space.width;
    objects.filter((o) => !o.is_destroyed).forEach((o) => {
      const dxy = detect_collision(p, o);
      if (dxy !== null && dxy < minDist) {
        nearest = o;
        minDist = dxy;
      }
    });
    if (nearest !== null) {
      if (callback === undefined) {
        nearest.is_destroyed = true;
      } else {
        callback(nearest);
      }
      p.is_destroyed = true;
    }
  };

  function destroy_ship(ship) {
    ship.is_destroyed = true;
    ship.debris = make_debris(ship, 40);
    ship.lifetime = MAX_LIFETIME;
    return true;
  };

  function detect_player_collisions(object) {
    const dxy = detect_collision(object, player);
    if (dxy !== null && !player.is_destroyed) {
      transfer_momentum(object, player);
      return destroy_ship(player);
    }
  };

  function get_all_deadly_objects() {
    return space.rocks
                .concat(space.enemies)
                .filter((o) => !o.is_destroyed);
  };

  function detect_collisions() {
    space.projectiles.forEach((p) => {
      detect_projectile_collisions(p, space.rocks);
      if (!p.is_destroyed) {
        if (p.type === 0) {
          detect_projectile_collisions(p, space.enemies, destroy_ship);
        } else {
          detect_projectile_collisions(p, [player], destroy_ship);
        }
      }
    });
    const objects = get_all_deadly_objects();
    for (let i = 0; i < objects.length && !player.is_destroyed; i++) {
      detect_player_collisions(objects[i]);
    }
  };


  function update_projectile(p) {
    if (p.distance_traveled > p.properties.distance_max) {
      p.is_destroyed = true;
    } else {
      const dt = t * ACCEL_TIME_SCALE;
      const delta = get_vector(p.angle, p.velocity * dt);
      p.distance_traveled += delta.len();
      p.position.add(delta);
      wrap_position(p);
      if (p.type > 0) {
        p.radius *= 1.0 + t/1000;
      }
      // the collision detection is handled after an update - therefore the
      // decision of whether or not to destroy the projectile is postponed
      // until the next update.
    }
    return !p.is_destroyed;
  };

  function update_projectiles() {
    space.projectiles.forEach((p) => {
      if (!p.is_destroyed) {
        update_projectile(p);
      }
    });
    space.projectiles = space.projectiles.filter(p => !p.is_destroyed);
  };

  function update_ship(ship) {
    const props = ship.properties;
    space.projectiles.push.apply(space.projectiles, ship.fired_projectiles);
    ship.fired_projectiles = [];
    // Turning
    if (ship.turn != 0 && !ship.is_destroyed) {
      const t_current = radians_to_degrees(ship.angle_pointed);
      const dt = t * TURN_TIME_SCALE;
      const dt_deg = ship.turn * props.turn_rate * dt;
      ship.angle_pointed += degrees_to_radians(dt_deg);
      ship.turn = 0; // reset for next timestep
    }
    // Acceleration
    if (ship.accel != 0 && !ship.is_destroyed) {
      // if acceleration is positive (i.e. no retro-thruster) and along the
      // same vector as current movement, and this ship is already moving at
      // max velocity, don't change anything
      if ((ship.velocity_abs == props.max_velocity) &&
          (ship.angle_moving == ship.angle_pointed) &&
          (ship.accel > 0) && (! ship.was_accelerating)) {
        ship.accel = 0;
      } else {
        const v = ship.velocity;
        const dv = ship.accel * t * ACCEL_TIME_SCALE;
        const dvx = Math.cos(ship.angle_pointed) * dv;
        const dvy = Math.sin(ship.angle_pointed) * dv;
        v.x += dvx;
        v.y += dvy;
        const v_total = v.len();
        ship.velocity_abs = v_total;
        if (v_total > props.max_velocity) {
          const f = props.max_velocity / v_total;
          ship.velocity.scale(f);
          ship.velocity_abs *= f;
        }
        ship.angle_moving = v.angle();
        //const p = ship.position;
        if (! ship.was_accelerating) {
          ship.accel = 0;
        }
      }
    }
    update_position(ship);
    ship.was_accelerating = false;
  };

  function update_player() {
    if (player.is_destroyed) {
      player.lifetime -= t;
    } else {
      update_ship(player);
    }
  };

  function update_asteroids() {
    const destroyed = space.rocks.filter((r) => r.is_destroyed);
    space.rocks = space.rocks.filter((r) => !r.is_destroyed);
    destroyed.forEach((a) => {
      const explosion = explode_asteroid(a);
      explosion.rocks.forEach((r) => space.rocks.push(r));
      explosion.debris.forEach((f) => space.debris.push(f));
    });
    space.rocks.forEach((rock) => {
      rock.angle += rock.radial_velocity;
      update_position(rock);
    });
  };

  function update_enemies() {
    space.enemies.forEach((e) => {
      if (!e.is_destroyed) {
        turn(e, CLOCKWISE);
        fire_weapon(e);
        update_ship(e);
      } else {
        e.lifetime -= t;
      }
    });
    space.enemies = space.enemies.filter((e) =>
      !e.is_destroyed || e.lifetime > 0);
  };

  function update_others() {
    // TODO
  };

  function update_debris_fragment(f) {
    f.lifetime -= t;
    if (f.lifetime < 0) {
      f.is_destroyed = true;
    } else {
      f.angle += f.radial_velocity;
      update_position(f);
    }
  };

  function update_object_debris(object) {
    object.debris.forEach((f) => update_debris_fragment(f));
    object.debris = object.debris.filter((f) => !f.is_destroyed);
  };

  // FIXME this sucks
  function update_debris() {
    [space, player].concat(space.enemies).forEach((object) =>
      update_object_debris(object));
  };

  detect_collisions();
  update_projectiles();
  update_player();
  update_asteroids();
  update_enemies();
  update_others();
  update_debris();
  if (space_cleared(space)) {
    space.lifetime -= t;
  }
};

function set_background(level) {
  const canvas = document.querySelector("canvas");
  canvas.style = `background-image: url('images/hubble${level}.jpg');`;
};

function start_game(renderer) {
  const canvas = document.querySelector("canvas");
  const w = canvas.width;
  const h = canvas.height;
  const game = new_game();

  const levels = [
    {
      "rocks": [2, 2, 2]
    },
    {
      "rocks": [2, 2, 2, 3]
    },
    {
      "rocks": [2, 2, 2],
      "enemies": [1]
    }
  ];

  function start_level() {
    set_background(game.level);
    const level = levels[game.level];
    const space = new_space(w, h);
    space.player = new_ship(w / 2, h / 2);
    for (let i = 0; i < level.rocks.length; i++) {
      const nFrag = level.rocks[i];
      space.rocks.push(new_random_asteroid(w, h, space.player, nFrag));
    }
    if (level.enemies !== undefined) {
      for (let i = 0; i < level.enemies.length; i++) {
        const enemyId = level.enemies[i];
        space.enemies.push(new_random_enemy(w, h, space.player, enemyId));
      }
    }
    game.current_space = space;
    game.state = "READY";
  };

  function isPaused() {
    return game.state === "READY" || game.state === "PAUSED";
  };

  function isOver() {
    return game.state === "OVER" || game.state === "WON";
  };

  const keys = new Set();
  function onKeyDown(evt) {
    if (!isOver()) {
      if (evt.code === "KeyP") {
        game.state = (isPaused()) ? "RUNNING" : "PAUSED";
      } else {
        keys.add(evt.code);
      }
    }
  };
  function onKeyUp(evt) {
    keys.delete(evt.code);
  };
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  function handle_player_state() {
    const player = game.current_space.player;
    if (!player.is_destroyed) {
      //console.log("current keys: ", keys);
      if (keys.has("ArrowLeft")) {
        turn(player, CLOCKWISE);
      } else if (keys.has("ArrowRight")) {
        turn(player, COUNTERCLOCKWISE);
      } else if (keys.has("ArrowDown")) {
        reverse_course(player);
      }
      if (keys.has("ArrowUp")) {
        accelerate(player);
      }
      if (keys.has("Space")) {
        fire_weapon(player);
      }
    }
  };

  function handle_game_state() {
    if (game.current_space.lifetime < 0) {
      game.level++;
      if (game.level === levels.length) {
        game.state = "WON";
      } else {
        start_level();
      }
    } else {
      if (game.current_space.player.lifetime < 0) {
        game.ships--;
        if (game.ships >= 0) {
          start_level();
        } else {
          game.state = "OVER";
        }
      }
    }
  };

  let lastTime = Date.now();
  function gameLoop () {
    const now = Date.now();
    const dt = (now - lastTime); // millis
    if (!isPaused() && !isOver()) {
      handle_player_state();
      update(game.current_space, dt);
      handle_game_state();
    }
    renderer(game, canvas);
    lastTime = now;
    requestAnimationFrame(gameLoop);
  };

  start_level();
  gameLoop();
};

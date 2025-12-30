function run_game(levels, width, height) {

  const C_EMPTY = " ";
  const C_WALL_H = "=";
  const C_WALL_V = "|";
  const C_CORNER_L = "(";
  const C_CORNER_R = ")";
  const C_DOOR = "-";
  const C_WALL = new Set([C_WALL_H, C_WALL_V, C_CORNER_L, C_CORNER_R, C_DOOR]);
  const C_FOOD = ".";
  const C_POWER = "$";
  const C_PLAYER = "@";
  const C_GHOST = "X";
  const T_POWER = 10000; // milliseconds
  const T_OPEN = 4000;
  const S_MOVE_USER = 150;
  const S_MOVE_GHOST = 400;
  const M_PAUSED = "PAUSED (press 'P' to resume)";
  const M_COMPLETE = "Level Complete";
  const M_WON = "GAME COMPLETE";
  const M_RESTART = "Restarting level";
  const DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  function initialize_game() {
    return {
      "score": 0,
      "maxScore": 0,
      "level_id": 0,
      "lives": 3,
      "paused": false,
      "active": true,
      "t_next": 0,
      "state": initialize_state(0),
      "message": null
    };
  };

  function initialize_state(level_id) {
    const level = levels(level_id);
    if (level === null) {
      return null;
    }

    function create_ghost(i, j) {
      return {
        "position": [i, j],
        "is_alive": true,
        "phase": 0, // Math.random() * Math.PI * 2,
        "direction": null,
        "move_frac": 0,
        "next_position": null
       };
    }

    function get_ghosts() {
      const ghosts = [];
      level.forEach((row, i) => {
        row.forEach((c, j) => {
          if (c == C_GHOST) {
            ghosts.push(create_ghost(i, j));
          }
        });
      });
      return ghosts;
    };

    function get_starting_position() {
      for (let i = 0; i < level.length; i++) {
        const j = level[i].findIndex((c) => c == C_PLAYER);
        if (j !== undefined && j > -1) {
          return [i, j];
        }
      }
    };

    function get_points_for_level() {
      let s = 0;
      level.forEach((row) => {
        row.forEach((c) => {if (c === C_FOOD || c === C_POWER) s++});
      });
      return s;
    };

    const player = {
      "position": get_starting_position(),
      "is_powered": false,
      "t_power": 0,
      "move_frac": 0,
      "is_alive": true,
      "next_position": null
    };

    return {
      "layout": level,
      "player": player,
      "ghosts": get_ghosts(),
      "points": 0,
      "bonus_points": 0,
      "finish_points": get_points_for_level(),
      "t_open": T_OPEN
    };
  };

  function to_char_code(codeBase) {
    function to_unicode(c) {
      if (c.startsWith("U+")) {
        return String.fromCodePoint(parseInt(c.substring(2, c.length), 16));
      } else {
        return String.fromCodePoint(parseInt(c, 16));
      }
    }
    const fields = codeBase.split(" ");
    return fields.map((c) => to_unicode(c)).join("");
  }

  function render(game) {
    const state = game.state;
    const player = state.player;

    const canvas = document.querySelector("canvas");
    const ctx = canvas.getContext('2d');
    //ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.fillStyle = "#000000"; //`rgba(0,0,0,0.0)`;
    ctx.fillRect(0, 0, width, height);
    ctx.stroke();

    const n_rows = state.layout.length;
    const n_cols = state.layout[0].length;
    const pixels_per_square = (height * 0.95) / 32;
    const half_square = pixels_per_square / 2;
    const pixels_w = pixels_per_square * n_cols;
    const offset_x = (width - pixels_w) / 2;
    const offset_y = height * 0.025;

    function to_xy_origin(i, j) {
      return [j * pixels_per_square + half_square + offset_x,
              i * pixels_per_square + half_square + offset_y];
    };

    function render_string(charString, xy, color, fontScale, textAlign) {
      ctx.save();
      const fontSize = Math.max(8, Math.floor(half_square * fontScale));
      ctx.font = `${fontSize}pt Monaco`;
      ctx.beginPath();
      ctx.textAlign = (textAlign === undefined) ? "center" : textAlign;
      ctx.textBaseline = "middle";
      if (color !== undefined && color !== null) {
        ctx.fillStyle = color;
      }
      ctx.fillText(charString, xy[0], xy[1]);
      ctx.stroke();
      ctx.restore();
    };

    function render_game_controls() {
      const score = game.score + state.points + state.bonus_points;
      render_string(`Score: ${score}`, [width * 0.01, height*0.99],
                    "#00ff00", 1, "left");
      render_string(`Lives: ${game.lives}`, [width*0.99, height*0.99],
                    "#ffff00", 1, "right");
      if (game.paused) {
        render_string(M_PAUSED, [width/2,height/2], "#ffff00", 2);
      } else if (!game.active) {
        if (game.lives === 0) {
          render_string("GAME OVER", [width/2,height/2], "#ff0000", 2);
        } else {
          render_string("GAME WON", [width/2,height/2], "#ffff00", 2);
        }
      }
    }

    function render_unicode(uc, xy, fontScale) {
      return render_string(to_char_code(uc), xy, null, fontScale);
    };

    function render_food(i, j) {
      render_string("$", to_xy_origin(i, j), "#dfaf37", 1);
    };

    function render_power(i, j) {
      render_unicode("U+2B50", to_xy_origin(i, j), 1.5);
    };

    function render_wall(i, j) {
      const wall_type = state.layout[i][j];
      const xy = to_xy_origin(i, j);
      ctx.save();
      ctx.beginPath();
      ctx.lineWidth = Math.max(2, half_square * 0.2);
      if (wall_type === C_DOOR) {
        const alpha = state.t_open / T_OPEN;
        ctx.strokeStyle = `rgba(255,0,0,${alpha})`; //"#ff0000";
      } else {
        ctx.strokeStyle = "#0000ff";
      }
      switch (wall_type) {
        case C_WALL_H:
        case C_DOOR:
          ctx.moveTo(xy[0] - half_square, xy[1]);
          ctx.lineTo(xy[0] + half_square, xy[1]);
          break;
        case C_WALL_V:
          ctx.moveTo(xy[0], xy[1] - half_square);
          ctx.lineTo(xy[0], xy[1] + half_square);
          break;
        case C_CORNER_L:
          if (i === 0 ||
              (state.layout[i-1][j] !== C_WALL_V &&
               state.layout[i-1][j] !== C_CORNER_L) ||
              (i < n_rows -1 && state.layout[i+1][j] === C_WALL_V)) {
            // down arc
            ctx.arc(xy[0] + half_square,
                    xy[1] + half_square,
                    half_square,
                    Math.PI,
                    Math.PI*1.5);
          } else {
            // up arc
            ctx.arc(xy[0] + half_square,
                    xy[1] - half_square,
                    half_square,
                    Math.PI/2,
                    Math.PI);
          }
          break;
        case C_CORNER_R:
          if (i === 0 ||
              (state.layout[i-1][j] !== C_WALL_V &&
               state.layout[i-1][j] !== C_CORNER_R) ||
              (i < n_rows -1 && state.layout[i+1][j] === C_WALL_V)) {
            ctx.arc(xy[0] - half_square,
                    xy[1] + half_square,
                    half_square,
                    -Math.PI*0.5,
                    0);
          } else {
            ctx.arc(xy[0] - half_square,
                    xy[1] - half_square,
                    half_square,
                    0,
                    Math.PI/2);
          }
          break;
      }
      ctx.stroke();
      ctx.restore();
    };

    function render_door(i, j) {
      render_wall(i, j); //render_string("=", to_xy_origin(i, j), "#ff0000", 2);
    };

    function render_ghost(ghost) {
      const xy = to_xy_origin(...ghost.position);
      const y = xy[1] + Math.sin(ghost.phase) * (half_square / 8);
      const ghostScale = (player.is_powered === true) ? 1.5 : 2;
      render_unicode("U+1F47B", [xy[0], y], ghostScale); // FIXME
    };

    function render_player() {
      const pos = to_xy_origin(...player.position);
      if (player.move_frac > 0) {
        const pos2 = to_xy_origin(...player.next_position);
        pos[0] = pos[0] + (pos2[0] - pos[0]) * player.move_frac;
        pos[1] = pos[1] + (pos2[1] - pos[1]) * player.move_frac;
      }
      const playerScale = (player.is_powered === true) ? 2 : 1.5;
      render_unicode("U+1F60B", pos, playerScale); // FIXME
    };

    function render_layout_square(c, i, j) {
      switch (c) {
        case C_EMPTY:
          break;
        case C_FOOD:
          render_food(i, j);
          break;
        case C_POWER:
          render_power(i, j);
          break;
        case C_GHOST: // handled above
          break;
        case C_PLAYER: // handled above
          break;
        case C_DOOR: // TODO
          render_door(i, j);
          break;
        case C_WALL_H:
        case C_WALL_V:
        case C_CORNER_L:
        case C_CORNER_R:
          render_wall(i, j);
          break;
        default:
          console.log(`ERROR unrecognized code ${c} at ${i},${j}`);
          break;
      }
    }

    state.layout.forEach((row, i) => {
      row.forEach((c, j) => render_layout_square(c, i, j));
    });
    if (player.is_alive) {
      render_player();
    }
    state.ghosts.forEach((ghost) => {
      if (ghost.is_alive) {
        render_ghost(ghost);
      }
    });
    render_game_controls();
  };

  // to_pos should already be wrapped if appropriate
  function can_move_to(layout, from_pos, to_pos) {
    return ((to_pos[0] >= 0) && (to_pos[1] >= 0) &&
            (to_pos[0] < layout.length) && (to_pos[1] < layout[0].length) &&
            !C_WALL.has(layout[to_pos[0]][to_pos[1]]));
  };

  function get_pos_rel(layout, pos, di, dj) {
    const n_rows = layout.length;
    const n_cols = layout[0].length;
    const i = pos[0] + di;
    const j = pos[1] + dj;
    // wraparound is determined here
    return [(i >= n_rows) ? 0 : ((i < 0) ? n_rows + di : i),
            (j >= n_cols) ? 0 : ((j < 0) ? n_cols + dj : j)];
  };

  function open_all_doors(layout) {
    for (let i = 0; i < layout.length; i++) {
      for (let j = 0; j < layout[i].length; j++) {
        if (layout[i][j] === C_DOOR) {
          layout[i][j] = C_EMPTY;
        }
      }
    }
  };

  function start_game(game) {
    const keys = new Set();
    function onKeyDown(evt) {
      switch (evt.code) {
        case "KeyP":
          game.paused = game.paused ? false : true;
          break;
        default:
          keys.add(evt.code);
      }
    };
    function onKeyUp(evt) {
      keys.delete(evt.code);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);

    function move_character_if_possible(c, di, dj) {
      if (c.next_position === null) {
        const to_pos = get_pos_rel(game.state.layout, c.position, di, dj);
        if (can_move_to(game.state.layout, c.position, to_pos)) {
          c.next_position = to_pos;
          c.move_frac = 0;
          // this accounts for wraparound
          c.position = [to_pos[0] - di, to_pos[1] - dj];
          return true;
        }
      }
    };

    function handle_input() {
      function move_if_possible(dj, di) {
        return move_character_if_possible(game.state.player, di, dj);
      };

      if (keys.has("KeyS") || keys.has("ArrowDown")) {
        move_if_possible(0, 1);
      } else if (keys.has("KeyA") || keys.has("ArrowLeft")) {
        move_if_possible(-1, 0);
      } else if (keys.has("KeyD") || keys.has("ArrowRight")) {
        move_if_possible(1, 0);
      } else if (keys.has("KeyW") || keys.has("ArrowUp")) {
        move_if_possible(0, -1);
      }
      return 0;
    };

    function detect_ghost_collision(ghost) {
      const player = game.state.player
      if (ghost.is_alive &&
          ghost.position[0] === player.position[0] &&
          ghost.position[1] === player.position[1]) {
        if (player.is_powered) {
          ghost.is_alive = false;
          game.state.bonus_points += 10;
        } else {
          player.is_alive = false;
        }
      }
    };

    function finish_move() {
      const player = game.state.player
      const ij = player.position;
      const layout = game.state.layout;
      const square = layout[ij[0]][ij[1]];
      if (square == C_FOOD) {
        layout[ij[0]][ij[1]] = C_EMPTY;
        game.state.points++;
      } else if (square == C_POWER) {
        layout[ij[0]][ij[1]] = C_EMPTY;
        player.is_powered = true;
        player.t_power = T_POWER;
        game.state.points++;
      } else {
        game.state.ghosts.forEach((ghost) => detect_ghost_collision(ghost));
      }
    };

    function update_state(dt) {
      const state = game.state;
      const player = state.player;

      function update_doors() {
        if (state.t_open > 0) {
          state.t_open = Math.max(0, state.t_open - dt);
          if (state.t_open === 0) {
            open_all_doors(state.layout);
          }
        }
      };

      function update_character_position(c, time_factor) {
        if (c.move_frac >= 0) {
          c.move_frac = Math.min(1, c.move_frac + dt / time_factor);
        }
        if (c.move_frac == 1) {
          c.position = c.next_position;
          c.move_frac = -1;
          c.next_position = null;
          return true;
        }
        return false;
      };

      function is_clear(a) {
        return a.every(c => !C_WALL.has(c));
      };

      function is_clear_h(i, j1, j2) {
        return is_clear(game.state.layout[i].slice(j1, j2));
      };

      function is_clear_v(i1, i2, j) {
        return is_clear(game.state.layout.map((row) => row[j]).slice(i1, i2));
      };

      function get_clear_line_of_sight(ij) {
        if (ij[0] === player.position[0]) {
          if (ij[1] < player.position[1]) {
            if (is_clear_h(ij[0], ij[1], player.position[1])) {
              return [0, 1];
            }
          } else {
            if (is_clear_h(ij[0], player.position[1], ij[1])) {
              return [0, -1];
            }
          }
        } else if (ij[1] === player.position[1]) {
          if (ij[0] < player.position[0]) {
            if (is_clear_v(ij[0], player.position[0], ij[1])) {
              return [1, 0];
            }
          } else {
            if (is_clear_v(player.position[0], ij[0], ij[1])) {
              return [-1, 0];
            }
          }
        }
        return null;
      };

      function update_ghost_position(ghost) {
        if (ghost.next_position !== null) {
          if (update_character_position(ghost, S_MOVE_GHOST)) {
            if (detect_ghost_collision(ghost)) {
              return;
            }
          }
        }
        const los = get_clear_line_of_sight(ghost.position);
        if (los !== null) {
          move_character_if_possible(ghost, ...los);
          ghost.direction = los;
        } else {
          if (ghost.direction !== null) {
            if (move_character_if_possible(ghost, ...ghost.direction)) {
              return true;
            }
          }
          const trials = new Set([]);
          while (trials.size < 4) {
            const k = Math.floor(Math.random()*4);
            trials.add(k);
            const dij = DIRECTIONS[k];
            if (move_character_if_possible(ghost, ...dij)) {
              ghost.direction = dij;
              break;
            }
          }
        }
        
      };

      update_doors();
      state.ghosts.filter((g) => g.is_alive).forEach((ghost) => {
        //ghost.phase += dt / 200;
        update_ghost_position(ghost);
      });
      if (player.next_position !== null) {
        if (update_character_position(player, S_MOVE_USER)) {
          finish_move(state.layout, player.position);
        }
      }
      if (player.is_powered) {
        player.t_power -= dt;
        if (player.t_power <= 0) {
          player.t_power = 0;
          player.is_powered = false;
        }
      }
    }

    function update_game() {
      const state = game.state;
      const player = game.state.player;
      if (!player.is_alive) {
        game.lives--;
        if (game.lives > 0) {
          game.t_next = 1000;
          game.message = M_RESTART;
        } else {
          game.t_next = 500;
        }
      } else if (state.points === state.finish_points) {
        game.score += state.points + state.bonus_points;
        // XXX this just ensures correct display
        state.points = state.bonus_points = 0;
        game.level_id++;
        game.t_next = 2000;
        game.message = M_COMPLETE;
      }
    };

    let lastTime = Date.now();
    function game_loop () {
      let t = Date.now();
      const dt = t - lastTime;
      lastTime = t;
      if (!game.paused && game.active && game.t_next === 0) {
        handle_input();
        update_state(dt);
        update_game();
      } else if (game.t_next > 0) {
        game.t_next = Math.max(game.t_next - dt, 0);
        if (game.t_next === 0) {
          if (game.lives > 0) {
            const next_state = initialize_state(game.level_id);
            if (next_state === null) {
              game.message = M_WON;
              game.active = false;
            } else {
              game.state = next_state;
              game.message = null;
            }
          } else {
            game.active = false;
          }
        }
      }
      render(game);
      window.requestAnimationFrame(game_loop);
    };
    game_loop();
  };
  
  start_game(initialize_game());
};

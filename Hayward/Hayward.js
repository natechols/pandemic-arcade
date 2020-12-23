/** this source code is in the public domain
  * natechols 2020-11-23
  */

// FIXME the handling of spare blocks when a row is removed is not quite in
// line with the original game, where compound scores were possible as bricks
// kept falling

function make_board () {

let idx = 0;
const N_COLS = 10;
const N_ROWS = 20;
const BUFFER = 20;
const BLOCK_SIZE = 50;
const BLOCK_INNER_SIZE = 46;
const BLOCK_BORDER = 2;
const FIELD_X_START = 250;
const WIDTH_PIXELS = FIELD_X_START + BUFFER * 2 + N_COLS * BLOCK_SIZE;
const HEIGHT_PIXELS = BUFFER * 2 + N_ROWS * BLOCK_SIZE;
const BRICKS = [
  [
    [1, 1],
    [1, 1]
  ],
  [
    [1, 1, 1, 1]
  ],
  [
    [1, 1, 1],
    [0, 0, 1]
  ],
  [
    [1, 1, 1],
    [1, 0, 0]
  ],
  [
    [1, 1, 0],
    [0, 1, 1]
  ],
  [
    [0, 1, 1],
    [1, 1, 0]
  ],
  [
    [1, 1, 1],
    [0, 1, 0]
  ]
];
const COLORS = [
  "#d00060",
  "#60d060",
  "#d0d000",
  "#d0a000",
  "#d060d0",
  "#a060ff",
  "#6060d0"
];
const LEFT = 0;
const RIGHT = 1;
const DOWN = 2;

function sum(x) {
  return x.reduce(function (a, b) {
    return a + b;
  });
};

function make_pos(i, j) {
  return {
    "x": i,
    "y": j
  };
};

function get_pos_screen(pos) {
  return make_pos(FIELD_X_START + BUFFER + (pos.x * BLOCK_SIZE),
                  BUFFER + (pos.y * BLOCK_SIZE));
};

function get_block(i, j) {
  return {
    "pos": make_pos(i, j),
    "visible": true
  };
};

function rotate90(a) {
  const transposed = [];
  for (let i = a[0].length - 1; i >= 0; i--) {
    const row = [];
    for (let j = 0; j < a.length; j++) {
      row.push(a[j][i]);
    }
    transposed.push(row);
  }
  return transposed;
};

function rotate_matrix(matrix, rotation) {
  let x = matrix;
  if (rotation === undefined || rotation === 0) {
    return x;
  } else {
    let k = 0;
    while (k < rotation) {
      x = rotate90(x);
      k += 1;
    }
    return x;
  }
};

function get_blocks(brickId, rotation) {
  const blocks = [];
  const base = rotate_matrix(BRICKS[brickId], rotation);
  for (let i = 0; i < base.length; i++) {
    for (let j = 0; j < base[i].length; j++) {
      if (base[i][j] == 1) {
        blocks.push(get_block(i, j));
      }
    }
  }
  return blocks;
};

function get_brick(brickId) {
  return {
    "id": idx++,
    "brickId": brickId,
    "rotation": 0,
    "blocks": get_blocks(brickId),
    "active": true
  };
};

function copy_brick(brick) {
  return {
    "id": brick.id,
    "brickId": brick.brickId,
    "rotation": 0,
    "blocks": brick.blocks.map((b) => get_block(b.pos.x, b.pos.y)),
    "active": brick.active
  };
};

function get_random_brick() {
  const brickId = Math.floor(Math.random() * BRICKS.length);
  return get_brick(brickId);
};

// FIXME this makes blocks drift to the right
function rotate_brick(brick) {
  const blocks = brick.blocks;
  const centX = Math.floor(sum(blocks.map((b) => b.pos.x)) / blocks.length);
  const centY = Math.floor(sum(blocks.map((b) => b.pos.y)) / blocks.length);
  if (brick.rotation === 3) {
    brick.rotation = 0;
  } else {
    brick.rotation += 1;
  }
  brick.blocks = get_blocks(brick.brickId, brick.rotation);
  let minX = 0, maxX = 9;
  brick.blocks.forEach(function (block) {
    block.pos.x += centX;
    block.pos.y += centY;
    minX = Math.min(minX, block.pos.x);
    maxX = Math.max(maxX, block.pos.x);
  });
  if (minX < 0) {
    brick.blocks.forEach((b) => b.pos.x -= minX);
  } else if (maxX > 9) {
    brick.blocks.forEach((b) => b.pos.x -= (maxX - 9));
  }
};

function is_visible_brick(brick) {
  return brick.blocks.filter((b) => b.visible).length > 0;
};

function make_board_mask(board) {
  const rows = [];
  for (let j = 0; j < N_ROWS; j++) {
    const row = [];
    for (let i = 0; i < N_COLS; i++) {
      row.push(false);
    }
    rows.push(row);
  }
  board.bricks.forEach(function (brick) {
    brick.blocks.forEach(function (block) {
      if (block.visible) {
        rows[block.pos.y][block.pos.x] = true;
      }
    });
  });
  return rows;
};

function find_solid_rows(board) {
  const rows = make_board_mask(board);
  const solidRows = [];
  for (let j = 0; j < N_ROWS; j++) {
    const row = rows[j];
    if (row.every((x) => x === true)) {
      solidRows.push(j);
    }
  }
  return solidRows;
};

function move_block(block, direction) {
  switch (direction) {
    case LEFT:
      block.pos.x--;
      break;
    case RIGHT:
      block.pos.x++;
      break;
    case DOWN:
      block.pos.y++;
      break;
  }
};

function is_in_bounds(block) {
  return block.pos.x >= 0 && block.pos.x < N_COLS && block.pos.y < N_ROWS;
}

function is_overlap(a, b) {
  return a.pos.x === b.pos.x && a.pos.y === b.pos.y;
}

function is_valid_block(block, otherBricks) {
  if (!is_in_bounds(block)) {
    return false;
  }
  if (otherBricks.length > 0) {
    for (let i = 0; i < otherBricks.length; i++) {
      const otherBrick = otherBricks[i];
      for (let j = 0; j < otherBrick.blocks.length; j++) {
        if (is_overlap(block, otherBrick.blocks[j])) {
          return false;
        }
      }
    }
  }
  return true;
}

function copy_blocks(brick) {
  return brick.blocks.map((b) => get_block(b.pos.x, b.pos.y));
}

function can_move_brick(brick, board, direction) {
  const testBlocks = copy_blocks(brick);
  testBlocks.forEach((b) => move_block(b, direction));
  const otherBricks = board.bricks.filter((other) => other.id != brick.id);
  for (let i = 0; i < testBlocks.length; i++) {
    if (!is_valid_block(testBlocks[i], otherBricks)) {
      return false;
    }
  }
  return true;
}

function can_rotate_brick(brick, board) {
  const testBrick = copy_brick(brick);
  rotate_brick(testBrick);
  const otherBricks = board.bricks.filter((other) => other.id != brick.id);
  for (let i = 0; i < testBrick.blocks.length; i++) {
    if (!is_valid_block(testBrick.blocks[i], otherBricks)) {
      return false;
    }
  }
  return true;
};

function can_move(board, direction) {
  const brick = get_active_brick(board);
  if (brick !== null) {
    return can_move_brick(brick, board, direction);
  }
  return false;
};

function move_brick(brick, board, direction) {
  if (can_move_brick(brick, board, direction)) {
    brick.blocks.map((b) => move_block(b, direction));
    return true;
  } else {
    return false;
  }
}

function move_active_brick(board, direction) {
  const brick = get_active_brick(board);
  if (brick !== null) {
    if (can_move_brick(brick, board, direction)) {
      brick.blocks.map((b) => move_block(b, direction));
      return true;
    } else {
      return false;
    }
  }
  return false;
}

function rotate_active_brick(board) {
  const brick = get_active_brick(board);
  if (brick !== null) {
    if (can_rotate_brick(brick, board)) {
      rotate_brick(brick);
      return true;
    }
  }
  return false;
}

function get_active_brick(board) {
  if (board.bricks.length > 0) {
    const lastBrick = board.bricks[board.bricks.length - 1];
    if (lastBrick.active) {
      return lastBrick;
    }
  }
  return null;
};

function add_new_brick(board) {
  if (board.nextBrick === null) { // start of game
    board.nextBrick = get_random_brick();
  }
  const brick = board.nextBrick;
  board.nextBrick = get_random_brick();
  brick.blocks.forEach((b) => b.pos.x += 3);
  if (!can_move_brick(brick, board, DOWN)) {
    console.log("OUT OF MOVES");
    console.log(board.bricks);
    board.active = false;
    return false;
  }
  board.bricks.push(brick);
};

function remove_rows(board, rows) {
  board.bricks.forEach(function (brick) {
    brick.blocks.forEach(function (block) {
      if (rows.has(block.pos.y)) {
        block.visible = false;
        block.pos = make_pos(-1, -1);
      }
    });
  });
  board.bricks = board.bricks.filter(is_visible_brick);
};

function drop_stacks(board, rows) {
  board.bricks.forEach(function (brick) {
    brick.blocks.forEach(function (block) {
      rows.forEach(function (rowId) {
        if (block.pos.y < rowId) {
          move_block(block, DOWN);
        }
      });
    });
  });
};

function clear_board(board) {
  board.bricks = [];
  board.active = true;
  board.maxScore = Math.max(board.maxScore, board.score);
  console.log(`maxScore = ${board.maxScore}`);
  board.score = 0;
  board.statusMsg = "";
}

function render(board, rowsToRemove) {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext('2d');

  function render_block(pos, color) {
    const coords = get_pos_screen(pos);
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.fillRect(coords.x + BLOCK_BORDER,
                 coords.y + BLOCK_BORDER,
                 BLOCK_INNER_SIZE,
                 BLOCK_INNER_SIZE);
    ctx.stroke();
    ctx.restore();
  };

  function render_brick(brick) {
    const color = COLORS[brick.brickId];
    for (let i = 0; i < brick.blocks.length; i++) {
      const block = brick.blocks[i];
      if (block.visible) {
        render_block(block.pos, color);
      }
    }
  }

  function render_next_brick(brick) {
    ctx.save();
    ctx.translate(-40, 50);
    ctx.scale(0.5, 0.5);
    render_brick(brick);
    ctx.restore();
  }

  function render_game_field() {
    // main bricks
    for (let k = 0; k < board.bricks.length; k++) {
      render_brick(board.bricks[k]);
    }
    // removed rows
    if (rowsToRemove !== null) {
      rowsToRemove.forEach((j) => {
        for (let i = 0; i < N_COLS; i++) {
          render_block(make_pos(i, j), "#ffffff");
        }
      });
    }
  }

  function render_frame() {
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, WIDTH_PIXELS, HEIGHT_PIXELS);
    ctx.stroke();
    ctx.strokeStyle = "#ffffff";
    ctx.strokeRect(FIELD_X_START + 10, 10,
                   WIDTH_PIXELS - 20 - FIELD_X_START, HEIGHT_PIXELS - 20);
    ctx.fillStyle = "#a0ff40";
    ctx.font = "16pt Monaco";
    ctx.textBaseline = "hanging";
    ctx.fillText(`Score: ${board.score}`, 10, 10);
    ctx.fillText("Next:", 10, 64);
    ctx.restore();
    if (board.nextBrick !== null) {
      render_next_brick(board.nextBrick);
    }
  }

  render_frame();
  render_game_field();
};

function add_new_brick(board) {
  if (board.nextBrick === null) { // start of game
    board.nextBrick = get_random_brick();
  }
  const brick = board.nextBrick;
  board.nextBrick = get_random_brick();
  brick.blocks.forEach((b) => b.pos.x += 3);
  if (!can_move_brick(brick, board, DOWN)) {
    console.log("OUT OF MOVES");
    console.log(board.bricks);
    board.active = false;
    return false;
  }
  board.bricks.push(brick);
};

function remove_rows(board, rows) {
  board.bricks.forEach(function (brick) {
    brick.blocks.forEach(function (block) {
      if (rows.has(block.pos.y)) {
        block.visible = false;
        block.pos = make_pos(-1, -1);
      }
    });
  });
  board.bricks = board.bricks.filter(is_visible_brick);
};

function drop_stacks(board, rows) {
  board.bricks.forEach(function (brick) {
    brick.blocks.forEach(function (block) {
      rows.forEach(function (rowId) {
        if (block.pos.y < rowId) {
          move_block(block, DOWN);
        }
      });
    });
  });
};

function start_game(board) {
  const keys = new Set();
  function onKeyDown(evt) {
    switch (evt.code) {
      case "KeyP":
        board.paused = board.paused ? false : true;
        console.log("pause:", board.paused);
        break;
      case "Space":
        if (!board.active) {
          clear_board(board);
        } else {
          console.log("ignoring space, board is active");
        }
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

  function handle_input() {
    if (keys.has("KeyS") || keys.has("ArrowDown")) {
      if (move_active_brick(board, DOWN)) {
        return 100;
      }
    } else if (keys.has("KeyA") || keys.has("ArrowLeft")) {
      if (move_active_brick(board, LEFT)) {
        return 100;
      }
    } else if (keys.has("KeyD") || keys.has("ArrowRight")) {
      if (move_active_brick(board, RIGHT)) {
        return 100;
      }
    } else if (keys.has("KeyW") || keys.has("ArrowUp")) {
      if (rotate_active_brick(board)) {
        return 200;
      }
    }
    return 0;
  };

  let lastTime = Date.now();
  let tAnim = 0, tDrop = 0, tInput = 0;
  let rowsToRemove = null;
  function gameLoop () {
    let t = Date.now();
    const dt = t - lastTime;
    lastTime = t;
    function t_minus(x) {
      return Math.max(x - dt, 0);
    };
    if (!board.paused && board.active) {
      if (tInput <= 0) {
        tInput = handle_input();
      }
      if (tAnim <= 0 && tDrop <= 0 && rowsToRemove === null) {
        if (can_move(board, DOWN)) {
          move_active_brick(board, DOWN);
          tDrop = 1000;
        } else {
          const solidRows = find_solid_rows(board);
          if (solidRows.length > 0) {
            rowsToRemove = new Set(solidRows);
            tAnim = 200;
          } else {
            add_new_brick(board);
            tDrop = 500;
          }
        }
      }
      render(board, rowsToRemove);
      if (rowsToRemove !== null) {
        if (tAnim <= 0) {
          remove_rows(board, rowsToRemove);
          board.score += rowsToRemove.size * rowsToRemove.size;
          drop_stacks(board, rowsToRemove);
          tDrop = 100;
          rowsToRemove = null;
          //dropStacks = rows;
        }
      }
      tInput = t_minus(tInput);
      tDrop = t_minus(tDrop);
      tAnim = t_minus(tAnim);
    }
    window.requestAnimationFrame(gameLoop);
  }
  gameLoop();
};

const board = {
  "bricks": [],
  "nextBrick": null,
  "active": true,
  "paused": false,
  "statusMsg": null,
  "score": 0,
  "maxScore": 0
};
start_game(board);
}

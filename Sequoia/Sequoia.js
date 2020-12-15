/**
  * This code is in the public domain
  * natechols 2020-12-13
  * TODO proper face cards
  */

function setup_board(width) {

const LABELS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
const LABEL_POSITIONS = [
  [[0.5, 0.5]],
  [[0.5, 0.33], [0.5, 0.66]],
  [[0.5, 0.33], [0.33, 0.66], [0.66, 0.66]],
  [[0.33, 0.33], [0.66, 0.33], [0.33, 0.66], [0.66, 0.66]],
  [[0.5, 0.5], [0.33, 0.25], [0.66, 0.25], [0.33, 0.75], [0.66, 0.75]],
  [[0.33, 0.25], [0.66, 0.25],
   [0.33, 0.5], [0.66, 0.5],
   [0.33, 0.75], [0.66, 0.75]],
  [[0.33, 0.25], [0.66, 0.25],
   [0.33, 0.5], [0.66, 0.5],
   [0.25, 0.75], [0.5, 0.75], [0.75, 0.75]],
  [[0.25, 0.25], [0.5, 0.25], [0.75, 0.25],
   [0.33, 0.5], [0.66, 0.5],
   [0.25, 0.75], [0.5, 0.75], [0.75, 0.75]],
  [[0.25, 0.25], [0.5, 0.25], [0.75, 0.25],
   [0.25, 0.5], [0.5, 0.5], [0.75, 0.5],
   [0.25, 0.75], [0.5, 0.75], [0.75, 0.75]],
  [[0.33, 0.2], [0.66, 0.2],
   [0.25, 0.4], [0.5, 0.4], [0.75, 0.4],
   [0.25, 0.6], [0.5, 0.6], [0.75, 0.6],
   [0.33, 0.8], [0.66, 0.8]]
];

// fonts are calibrated for this
const WIDTH_REF = 1600;
const FONT_SCALE = width / 1600;
const SUITS = ["\u2660", "\u2665", "\u2666", "\u2663"];
const COLORS = ["#000000", "#ff0000", "#ff0000", "#000000"];
// this includes padding around the card
const BOARD_CENTER = width * 0.5;
const BUFFER = width * 0.0125;
const STACK_WIDTH = width * 0.11875;
const TABLEAU_CARD_Y_OFFSET = width * 0.01875;
const TABLEAU_Y_START = width * 0.25;
const CARD_HEIGHT = width * 0.125;
const CARD_WIDTH = width * 0.09375;
const CARD_THICKNESS = 1;
const CORNER_RADIUS = Math.max(2, width * 0.003125);
const BORDER_WIDTH = 1;
const BORDER_WIDTH_SELECTED = 2;
const BORDER_COLOR = "#000000";
const CARD_BG = "#ffffff";
const CARD_BG_SELECTED = "#c0c0c0";
const FOUNDATION_EMPTY = "rgba(240, 240, 240, 0.5)";
const FOUNDATION_SELECTED = "rgba(150, 150, 150, 0.5)";
const FOUNDATION_BORDER = 'rgba(200, 200, 200, 0.8)';
const FREE_EMPTY = "rgba(220, 220, 220, 0.2)";
const TOP_CELL_Y = width * 0.0625;

function make_cards() {
  const cards = [];
  for (let suit = 0; suit < 4; suit++) {
    for (let value = 0; value < 13; value++) {
      cards.push({
        "suit": suit,
        "value": value,
        "selected": false,
        "x": 0,
        "y": 0,
        "oldX": null,
        "oldY": null
      });
    }
  }
  // https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle
  for (let i = cards.length - 1; i >= 1; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmpJ = cards[j];
    cards[j] = cards[i];
    cards[i] = tmpJ;
  }
  return cards;
};

function make_outline(ctx, x, y) {
  ctx.beginPath();
  ctx.moveTo(x + CORNER_RADIUS, y);
  ctx.lineTo(x + CARD_WIDTH - CORNER_RADIUS, y);
  ctx.arc(x + CARD_WIDTH - CORNER_RADIUS, y + CORNER_RADIUS, CORNER_RADIUS, -Math.PI/2, 0);
  ctx.lineTo(x + CARD_WIDTH, y + CARD_HEIGHT - CORNER_RADIUS);
  ctx.arc(x + CARD_WIDTH - CORNER_RADIUS, y + CARD_HEIGHT - CORNER_RADIUS, CORNER_RADIUS, 0, Math.PI/2);
  ctx.lineTo(x + CORNER_RADIUS, y + CARD_HEIGHT);
  ctx.arc(x + CORNER_RADIUS, y + CARD_HEIGHT - CORNER_RADIUS, CORNER_RADIUS, Math.PI/2, Math.PI);
  ctx.lineTo(x, y + CORNER_RADIUS);
  ctx.arc(x + CORNER_RADIUS, y + CORNER_RADIUS, CORNER_RADIUS, Math.PI, Math.PI*1.5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

function draw_card_outline(ctx, card, isHighlighted) {
  ctx.strokeStyle = BORDER_COLOR;
  if (card.selected || isHighlighted === true) {
    ctx.fillStyle = CARD_BG_SELECTED;
    ctx.lineWidth = BORDER_WIDTH_SELECTED;
  } else {
    ctx.fillStyle = CARD_BG;
    ctx.lineWidth = BORDER_WIDTH;
  }
  return make_outline(ctx, card.x, card.y);
};

function draw_card_label(ctx, card) {
  const pts = Math.floor(14 * FONT_SCALE);
  ctx.font = `${pts}pt Gill Sans`;
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.fillStyle = COLORS[card.suit];
  ctx.fillText(`${LABELS[card.value]}${SUITS[card.suit]}`,
               card.x + CORNER_RADIUS,
               card.y + CORNER_RADIUS + 10);
};

function draw_card_center(ctx, card) {
  ctx.fillStyle = COLORS[card.suit];
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (card.value < LABEL_POSITIONS.length) {
    const pts = Math.floor((36 - (card.value * 2)) * FONT_SCALE);
    ctx.font = `${pts}pt Gill Sans`;
    for (let i = 0; i <= card.value; i++) {
      const xy = LABEL_POSITIONS[card.value][i];
      ctx.fillText(`${SUITS[card.suit]}`,
                   card.x + CARD_WIDTH*xy[0],
                   card.y + 10 + CARD_HEIGHT*xy[1]);
    }
  } else {
    const pts = Math.floor(48 * FONT_SCALE);
    ctx.font = `${pts}pt Gill Sans`;
    ctx.fillText(`${LABELS[card.value]} ${SUITS[card.suit]}`,
                 card.x + CARD_WIDTH/2,
                 card.y + CARD_HEIGHT / 2);
  }
};

function draw_top_card(ctx, card, isHighlighted) {
  draw_card_outline(ctx, card, isHighlighted);
  draw_card_label(ctx, card);
  draw_card_center(ctx, card);
};

function draw_tableau_stacked_card(ctx, card, isHighlighted) {
  draw_card_outline(ctx, card, isHighlighted);
  draw_card_label(ctx, card);
};

function draw_empty_cell(ctx, x, y, isHighlighted) {
  if (isHighlighted === true) {
    ctx.fillStyle = FOUNDATION_SELECTED;
  } else {
    ctx.fillStyle = FREE_EMPTY;
  }
  ctx.strokeStyle = FOUNDATION_BORDER;
  make_outline(ctx, x, y);
};

function draw_foundation(ctx, x, y, isHighlighted) {
  if (isHighlighted === true) {
    ctx.fillStyle = FOUNDATION_SELECTED;
  } else {
    ctx.fillStyle = FOUNDATION_EMPTY;
  }
  ctx.strokeStyle = FOUNDATION_BORDER;
  make_outline(ctx, x, y);
};

function get_tableau_x(idx) {
  if (idx >= 4) {
    return BOARD_CENTER + BUFFER + ((idx - 4) * STACK_WIDTH);
  } else {
    return (BUFFER*3) + (idx * STACK_WIDTH);
  }
};

function get_tableau_y(idx) {
  return TABLEAU_Y_START + (TABLEAU_CARD_Y_OFFSET * idx);
};

function get_free_cell_x(idx) {
  return BUFFER + (idx * STACK_WIDTH);
};

function get_foundation_x(idx) {
  return width + BUFFER - ((idx + 1) * STACK_WIDTH);
};

function draw_tableaux(ctx, board) {
  for (let i = 0; i < 8; i++) {
    const cards = board.tableau[i];
    const isHighlighted = board.selected_tableau === i;
    if (cards.length > 0) {
      const topCard = cards[cards.length - 1];
      const offset = topCard.selected ? 2 : 1;
      for (let i = 0; i < cards.length - offset; i++) {
        draw_tableau_stacked_card(ctx, cards[i], isHighlighted);
      }
      if (!topCard.selected) {
        draw_top_card(ctx, cards[cards.length - 1], isHighlighted);
      } else if (cards.length >= 2) {
        draw_top_card(ctx, cards[cards.length - 2], isHighlighted);
      }
    } else {
      const x = get_tableau_x(i);
      draw_empty_cell(ctx, x, TABLEAU_Y_START, isHighlighted);
    }
  }
};

function draw_free_cells(ctx, board) {
  for (let i = 0; i < 4; i++) {
    const free_cell = board.free_cells[i];
    if (free_cell.length === 0 ||
        is_top_card(board.selected_card, free_cell)) {
      const isHighlighted = board.selected_free === i;
      const cellX = get_free_cell_x(i);
      ctx.lineWidth = 4;
      draw_empty_cell(ctx, cellX, TOP_CELL_Y, isHighlighted);
    } else {
      draw_top_card(ctx, free_cell[0]);
    }
  }
};

function draw_foundations(ctx, board) {
  for (let i = 0; i < 4; i++) {
    const cards = board.foundations[i];
    const isHighlighted = board.selected_foundation === i;
    const cellX = get_foundation_x(i);
    ctx.lineWidth = 8;
    draw_foundation(ctx, cellX, TOP_CELL_Y, isHighlighted);
    if (cards.length > 0) {
      draw_top_card(ctx, cards[cards.length - 1], isHighlighted);
    }
  }
};

function draw_board(board) {
  const canvas = document.querySelector("canvas");
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  draw_tableaux(ctx, board);
  draw_free_cells(ctx, board);
  draw_foundations(ctx, board);
  if (board.selected_card !== null) {
    draw_top_card(ctx, board.selected_card);
  } else if (board.complete === true) {
    ctx.font = "36pt Gill Sans";
    ctx.fillStyle = "#ffff00";
    ctx.textAlign = "center";
    ctx.fillText("You won - click anywhere to play again", 800, 500);
  }
};

function is_top_card(card, others) {
  if ((card !== null) && (others.length > 0)) {
    return (card.suit === others[others.length - 1].suit &&
            card.value === others[others.length - 1].value);
  }
  return false;
};

function remove_selected_card(board) {
  const card = board.selected_card;
  for (let i = 0; i < 4; i++) {
    if (is_top_card(card, board.free_cells[i])) {
      board.free_cells[i] = [];
    }
  }
  for (let i = 0; i < 8; i++) {
    if (is_top_card(card, board.tableau[i])) {
      board.tableau[i].pop();
    }
  }
};

function drop_on_foundation(board) {
  remove_selected_card(board);
  const foundation = board.foundations[board.selected_foundation];
  const card = board.selected_card;
  foundation.push(card);
  card.x = get_foundation_x(board.selected_foundation);
  card.y = TOP_CELL_Y;
  clear_selection(board);
};

function drop_on_free(board) {
  remove_selected_card(board);
  board.free_cells[board.selected_free] = [board.selected_card];
  board.selected_card.x = get_free_cell_x(board.selected_free);
  board.selected_card.y = TOP_CELL_Y;
  clear_selection(board);
};

function drop_on_tableau(board) {
  remove_selected_card(board);
  const tableau = board.tableau[board.selected_tableau];
  const card = board.selected_card;
  card.x = get_tableau_x(board.selected_tableau);
  card.y = get_tableau_y(tableau.length); 
  tableau.push(card);
  clear_selection(board);
};

function is_in_bounds(cardX, cardY, x, y) {
  return ((x > cardX && x < cardX + CARD_WIDTH) &&
          (y > cardY && y < cardY + CARD_HEIGHT));
};

function is_in_tableau_bounds(tabX, tabY, nCards, x, y) {
  const yMax = tabY + CARD_HEIGHT + (nCards * TABLEAU_CARD_Y_OFFSET);
  return ((x > tabX && x < tabX + CARD_WIDTH) && (y > tabY && y < yMax));
};

function select_card(board, card, mouseX, mouseY) {
  card.selected = true;
  card.oldX = card.x;
  card.oldY = card.y;
  board.selected_card = card;
  board.mouseXdelta = mouseX - card.x;
  board.mouseYdelta = mouseY - card.y;
};

function try_select_top_card(board, cards, x, y) {
  if (cards.length > 0) {
    const topCard = cards[cards.length - 1];
    if (is_in_bounds(topCard.x, topCard.y, x, y)) {
      select_card(board, topCard, x, y);
    }
  }
};

function get_target_free_cell(board, x, y) {
  for (let i = 0; i < 4; i++) {
    if (board.free_cells[i].length === 0) {
      const cellX = get_free_cell_x(i);
      if (is_in_bounds(cellX, TOP_CELL_Y, x, y)) {
        return i;
      }
    }
  }
  return null;
};

function can_add_to_foundation(foundation, card) {
  if (foundation.length === 0) {
    return card.value === 0;
  } else {
    const idxLast = foundation.length - 1;
    return ((card.suit === foundation[idxLast].suit) &&
            (card.value === foundation[idxLast].value + 1));
  }
};

function get_target_foundation(board, x, y) {
  for (let i = 0; i < 4; i++) {
    const cellX = get_foundation_x(i);
    if (is_in_bounds(cellX, TOP_CELL_Y, x, y) &&
        can_add_to_foundation(board.foundations[i], board.selected_card)) {
      return i;
    }
  }
  return null;
};

function can_add_to_tableau(tableau, card) {
  if (tableau.length === 0) {
    return true;
  } else {
    const topCard = tableau[tableau.length - 1];
    return (COLORS[card.suit] != COLORS[topCard.suit] &&
            card.value === topCard.value - 1);
  }
};

function get_target_tableau(board, x, y) {
  for (let i = 0; i < 8; i++) {
    const cellX = get_tableau_x(i);
    const cellY = TABLEAU_Y_START;
    if (is_in_tableau_bounds(cellX, cellY, board.tableau[i].length, x, y) &&
        can_add_to_tableau(board.tableau[i], board.selected_card)) {
      return i;
    }
  }
  return null;
};

function auto_move(board, card) {
  for (let i = 0; i < 4; i++) {
    if (can_add_to_foundation(board.foundations[i], card)) {
      board.selected_card = card;
      board.selected_foundation = i;
      drop_on_foundation(board);
      redraw_layout(board);
      return true;
    }
  }
  return false;
};

function auto_move_cards(board, cards) {
  if (cards.length > 0) {
    const topCard = cards[cards.length - 1];
    return auto_move(board, topCard);
  }
  return false;
};

function auto_complete(board) {
  while (true) {
    let nextMove = false;
    for (let i = 0; i < 8; i++) {
      nextMove = nextMove || auto_move_cards(board, board.tableau[i]);
    }
    for (let i = 0; i < 4; i++) {
      nextMove = nextMove || auto_move_cards(board, board.free_cells[i]);
    }
    if (!nextMove) {
      break;
    }
  }
};

function on_mouse_down(board, x, y) {
  if (board.complete) {
    reset_board(board);
  } else {
    board.tableau.forEach(function (cards) {
      try_select_top_card(board, cards, x, y);
    });
    if (board.selected_card === null) {
      board.free_cells.forEach(function (cards) {
        try_select_top_card(board, cards, x, y);
      });
    }
  }
  draw_board(board);
};

function on_double_click(board, x, y, autoComplete) {
  if (board.complete) {
    reset_board(board);
  } else if (autoComplete === true) {
    auto_complete(board);
  } else {
    on_mouse_down(board, x, y);
    if (board.selected_card !== null) {
      if (!auto_move(board, board.selected_card)) {
        clear_selection(board);
        draw_board(board);
      }
    }
  }
};

function on_mouse_move(board, x, y) {
  if (board.selected_card !== null) {
    board.selected_card.x = x - board.mouseXdelta;
    board.selected_card.y = y - board.mouseYdelta;
    board.selected_free = get_target_free_cell(board, x, y);
    board.selected_foundation = get_target_foundation(board, x, y);
    board.selected_tableau = get_target_tableau(board, x, y);
  }
  draw_board(board);
};

function redraw_layout(board) {
  const nc = board.foundations.map((f) => f.length).reduce((a, b) => a + b);
  if (nc === 52) {
    board.complete = true;
  }
  draw_board(board);
};

function on_mouse_up(board, x, y) {
  if (board.selected_card !== null) {
    if (board.selected_free !== null) {
      drop_on_free(board);
    } else if (board.selected_foundation !== null) {
      drop_on_foundation(board);
    } else if (board.selected_tableau !== null) {
      drop_on_tableau(board);
    } else {
      reset_drag(board);
    }
    redraw_layout(board);
  }
};

function on_mouse_out(board) {
  if (board.selected_card !== null) {
    reset_drag(board);
    draw_board(board);
  }
};

function clear_selection(board) {
  if (board.selected_card !== null) {
    board.selected_card.selected = false;
  }
  board.selected_card = null;
  board.selected_free = null;
  board.selected_tableau = null;
  board.selected_foundation = null;
};

function reset_drag(board) {
  const card = board.selected_card;
  card.selected = false;
  card.x = card.oldX;
  card.y = card.oldY;
  clear_selection(board);
};

function bind_events(board) {
  const canvas = document.querySelector("canvas");
  function onMouseDown(evt) {
    return on_mouse_down(board, evt.offsetX, evt.offsetY);
  };
  function onMouseMove(evt) {
    if (evt.which === 1) {
      return on_mouse_move(board, evt.offsetX, evt.offsetY);
    }
  };
  function onMouseUp(evt) {
    return on_mouse_up(board, evt.offsetX, evt.offsetY);
  };
  function onMouseOut(evt) {
    return on_mouse_out(board);
  };
  function onDoubleClick(evt) {
    const autoComplete = evt.getModifierState("Shift");
    return on_double_click(board, evt.offsetX, evt.offsetY, autoComplete);
  };
  canvas.addEventListener("mousedown", onMouseDown);
  canvas.addEventListener("mousemove", onMouseMove);
  canvas.addEventListener("mouseup", onMouseUp);
  canvas.addEventListener("mouseout", onMouseOut);
  canvas.addEventListener("dblclick", onDoubleClick);
};

function deal_cards() {
  const cards = make_cards();
  const tableau = [[], [], [], [], [], [], [], []];
  for (let i = 0; i < 52; i++) {
    const card = cards[i];
    const tid = i % 8;
    card.x = get_tableau_x(tid);
    card.y = TABLEAU_Y_START + (TABLEAU_CARD_Y_OFFSET * tableau[tid].length);
    tableau[tid].push(card);
  }
  return tableau;
};

function reset_board(board) {
  clear_selection(board);
  board.tableau = deal_cards();
  board.foundations = [[], [], [], []];
  board.free_cells = [[], [], [], []];
  board.complete = false;
};

const gameBoard = {
  "tableau": null,
  "foundations": null,
  "free_cells": null,
  "selected_card": null,
  "selected_foundation": null,
  "selected_tableau": null,
  "selected_free": null,
  "complete": null
}
reset_board(gameBoard);
bind_events(gameBoard);
draw_board(gameBoard);
return gameBoard;
};

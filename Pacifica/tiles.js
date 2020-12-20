const CALIFORNIA = 0;
const FLAGS = 1;
const MAHJONG = 2;
const CUSTOM = 3;
const LABELS = ["California", "Flags", "Mahjong", "Custom"];

const MAHJONG_CODES = [
  "1F000", // east wind
  "1F001", // south wind
  "1F002", // west wind
  "1F003", // north wind
  "1F004", // red dragon
  "1F005", // green dragon
  "1F006", // white dragon
  "1F007", // one of characters
  "1F008", // two of characters
  "1F009", // three of characters
  "1F00A", // four of characters
  "1F00B", // five of characters
  "1F00C", // six of characters
  "1F00D", // seven of characters
  "1F00E", // eight of characters
  "1F00F", // nine of characters
  "1F010", // one of bamboos
  "1F011", // two of bamboos
  "1F012", // three of bamboos
  "1F013", // four of bamboos
  "1F014", // five of bamboos
  "1F015", // six of bamboos
  "1F016", // seven of bamboos
  "1F017", // eight of bamboos
  "1F018", // nine of bamboos
  "1F019", // one of circles
  "1F01A", // two of circles
  "1F01B", // three of circles
  "1F01C", // four of circles
  "1F01D", // five of circles
  "1F01E", // six of circles
  "1F01F", // sevel of circles
  "1F020", // eight of circles
  "1F021", // nine of circles
  "1F022", // plum
  "1F023", // orchid
  // not actually using these yet!
  "1F024", // bamboo
  "1F025", // chrysanthemum
  "1F026", // spring
  "1F027", // summer
  "1F028", // autumn
  "1F029", // winter
];
const MAHJONG_COLORS = [
  "blue", "blue", "blue", "blue", // winds
  null, "green", "blue", // dragons
  "red", "red", "red", "red", "red", "red" ,"red", "red", "red", "red",
  "green", "green", "green", "green", "green", "green" ,"green", "green", "green", "green",
  "blue", "blue", "blue", "blue", "blue", "blue" ,"blue", "blue", "blue", "blue",
  "black", "black"
];

// these need some work
const FLAG_CODES = [
  "1F1E6 1F1F2", // Armenia
  "1F1E6 1F1F7", // Argentina
  "1F1E6 1F1FA", // Australia
  "1F1E6 1F1FF", // Azerbaijan
  "1F1E7 1F1F7", // Brazil
  "1F1E8 1F1E6", // Canada
  "1F1E8 1F1EC", // Congo
  "1F1E8 1F1ED", // Switzerland
  "1F1E8 1F1F1", // Chile
  "1F1E8 1F1F3", // China
  "1F1F9 1F1FC", // Taiwan
  "1F1E8 1F1F7", // Costa Rica
  "1F1E8 1F1FA", // Cuba
  "1F1E9 1F1EA", // Germany
  "1F1E9 1F1F0", // Denmark
  "1F1E9 1F1F2", // Dominica
  "1F1EA 1F1F8", // Spain
  "1F1EB 1F1EE", // Finland
  "1F1EB 1F1F7", // France
  "1F1EC 1F1E7", // United Kingdom
  "1F1EC 1F1F7", // Greece
  "1F1EE 1F1EA", // Ireland
  "1F1EE 1F1F1", // Israel
  "1F1EE 1F1F3", // India
  "1F1EE 1F1F9", // Italy
  "1F1EF 1F1F2", // Jamaica
  "1F1EF 1F1F5", // Japan
  "1F1F0 1F1F7", // South Korea
  "1F1F2 1F1FD", // Mexico
  "1F1F3 1F1EC", // Nigeria
  "1F1F5 1F1F0", // Pakistan
  "1F1F7 1F1FA", // Russia
  "1F1F8 1F1EA", // Sweden
  "1F1F9 1F1FF", // Tanzania
  "1F1FA 1F1F8", // United States
  "1F1FB 1F1EA", // Venezuela
  "1F1FF 1F1E6", // South Africa
];

function Renderer(tileSize) {
  const images = [];
  for (let i = 1; i <= 36; i++) {
    const tileImg = new Image();
    tileImg.src = `tiles/tile${i}.jpg`;
    images.push(tileImg);
  }

  const TILE_CODES = [
    null,
    FLAG_CODES,
    MAHJONG_CODES
  ];

  function draw_white_bg(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, tileSize, tileSize);
    ctx.restore();
  };

  function render_flag(ctx, x, y, tileId) {
    draw_white_bg(ctx, x, y);
    ctx.save();
    const fontSize = Math.max(24, Math.floor(tileSize * 0.67));
    ctx.font = `${fontSize}pt Monaco`;
    ctx.beginPath();
    ctx.textAlign = "center";
    ctx.textBaseline = "hanging";
    const charString = to_char_code(FLAG_CODES[tileId]);
    ctx.fillText(charString, x+tileSize/2, y+tileSize/8);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  };

  function render_mahjong(ctx, x, y, tileId) {
    draw_white_bg(ctx, x, y);
    ctx.save();
    const fontSize = Math.max(24, Math.floor(tileSize * 0.5));
    ctx.font = `${fontSize}pt Monaco`;
    ctx.beginPath();
    ctx.textAlign = "center";
    ctx.textBaseline = "hanging";
    ctx.fillStyle = MAHJONG_COLORS[tileId];
    const charString = to_char_code(MAHJONG_CODES[tileId]);
    ctx.fillText(charString, x+tileSize/2, y+tileSize/8);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  };

  function render_image(ctx, x, y, tileId) {
    ctx.save();
    ctx.drawImage(images[tileId], x, y, tileSize - 2, tileSize - 2);
    ctx.restore();
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

  // XXX I hate this hacky OOP stuff but it made it easier to share this
  // code with the editor and switch between tiles
  this.render_tile = function(ctx, x, y, tileId) {
    switch (this.tileSet) {
      case CALIFORNIA:
        render_image(ctx, x, y, tileId);
        break;
      case MAHJONG:
        render_mahjong(ctx, x, y, tileId);
        break;
      case FLAGS:
        render_flag(ctx, x, y, tileId);
        break;
    }
  };
  this.set_tile = function (tileId, value) {
    TILE_CODES[this.tileSet][tileId] = value;
  };

  this.tileSet = 0;
  this.select_tiles = function (setId) {
    this.tileSet = setId;
  }
  this.get_tiles = function () {
    return TILE_CODES[this.tileSet];
  };
  this.get_code = function (tileId) {
    if (TILE_CODES[this.tileSet] === null) {
      return "";
    } else {
      //console.log(TILE_CODES[this.tileSet]);
      return TILE_CODES[this.tileSet][tileId];
    }
  };
  this.next_tile_set = function () {
    this.tileSet++;
    if (this.tileSet === TILE_CODES.length) {
      this.tileSet = 0;
    }
    return this.tileSet;
  };
  return this;
};

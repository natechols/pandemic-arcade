const CALIFORNIA = 0;
const FLAGS = 1;
const MAHJONG = 2;
const EMOJI = 3;
const CUSTOM = 4;
const LABELS = ["California", "Flags", "Mahjong", "Emoji", "Custom"];

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

const EMOJI_CODES = [
  "D83E DD86", // duck
  "D83E DD9A", // peacock
  "D83E DD9C", // parrot
  "D83E DD89", // owl
  "D83E DD83", // turkey
  "D83D DC14", // chicken
  "D83D DC16", // pig
  "D83D DC08", // cat
  "D83D DC07", // rabbit
  "D83D DC01", // mouse
  "D83D DC12", // monkey
  "D83E DD81", // lion
  "D83D DC0E", // horse
  "D83D DC22", // turtle
  "D83D DC0D", // snake
  "D83D DC0A", // crocodile
  "D83E DD88", // shark
  "D83D DC19", // octopus
  "D83D DC1F", // fish
  "D83D DC0B", // whale
  "D83D DC1A", // spiral shell
  "D83D DC38", // frog
  "D83E DD8B", // butterfly
  "D83D DC1E", // ladybug
  "D83D DC1D", // honeybee
  "D83D DC0C", // snail
  "D83D DC1C", // ant
  "D83C DF35", // cactus
  "D83C DF32", // evergreen tree
  "D83C DF33", // deciduous tree
  "D83C DF41", // maple leaf
  "D83C DF34", // palm tree
  "D83C DF39", // rose
  "D83C DF3B", // sunflower
  "D83C DF37", // tulip
  "D83C DF3C"  // blossom
];

function Renderer(tileSize) {
  const images = [];
  for (let i = 1; i <= 36; i++) {
    const tileImg = new Image();
    tileImg.src = `tiles/tile${i}.jpg`;
    images.push(tileImg);
  }

  const customTiles = EMOJI_CODES.map((x) => x);
  const TILE_CODES = [
    null,
    FLAG_CODES,
    MAHJONG_CODES,
    EMOJI_CODES,
    customTiles
  ];

  function draw_white_bg(ctx, x, y) {
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, tileSize, tileSize);
    ctx.restore();
  };

  function render_unicode(ctx, x, y, tileId, charString, fontScale, color) {
    draw_white_bg(ctx, x, y);
    ctx.save();
    const fontSize = Math.max(24, Math.floor(tileSize * fontScale));
    ctx.font = `${fontSize}pt Monaco`;
    ctx.beginPath();
    ctx.textAlign = "center";
    ctx.textBaseline = "hanging";
    if (color !== undefined) {
      ctx.fillStyle = MAHJONG_COLORS[tileId];
    }
    ctx.fillText(charString, x+tileSize/2, y+tileSize/8);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  };

  function render_flag(ctx, x, y, tileId) {
    const charString = to_char_code(FLAG_CODES[tileId]);
    render_unicode(ctx, x, y, tileId, charString, 0.67);
  };

  function render_mahjong(ctx, x, y, tileId) {
    const charString = to_char_code(MAHJONG_CODES[tileId]);
    const color = MAHJONG_COLORS[tileId];
    render_unicode(ctx, x, y, tileId, charString, 0.5, color);
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
      case EMOJI:
        render_unicode(ctx, x, y, tileId, to_char_code(EMOJI_CODES[tileId]), 0.67);
        break;
      case CUSTOM:
        render_unicode(ctx, x, y, tileId, to_char_code(customTiles[tileId]), 0.67);
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
  this.get_custom_tiles = function () {
    return customTiles;
  };
  this.apply_edits = function (tileCodes) {
    for (i = 0; i < 36; i++) {
      customTiles[i] = tileCodes[i];
    }
    if (this.tileSet !== CUSTOM) {
      this.tileSet = CUSTOM;
    }
  };
  return this;
};

function make_editor_table(tileSize, renderer) {
  function handle_change(tileId, tileInput, tileCanvas) {
    renderer.set_tile(tileId, tileInput);
    render_custom_tile(tileCanvas, tileId, renderer);
  };
  const table = document.getElementById("tiles-table");
  for (let i = 0; i < 4; i++) {
    const row = table.insertRow();
    for (let j = 0; j < 9; j++) {
      const tileId = (i * 9) + j;
      const cell = row.insertCell();
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = tileSize;
      canvas.id = `tile-${tileId+1}`;
      cell.appendChild(canvas);
      const br = document.createElement("br");
      cell.appendChild(br);
      const input = document.createElement("input");
      input.class = "code-input";
      input.size = 12;
      input.width = 100;
      input.height = 20;
      input.style = "background: #303030; color: yellow; text-align: center; font: 9pt Monaco; border-style: solid; border-color: #80b030; border-width: 1px";
      input.id = `code-${tileId+1}`;
      cell.appendChild(input);
      function onChange(evt) {
        const value = input.value;
        handle_change(tileId, value, canvas);
      };
      input.onchange = onChange;
      input.addEventListener("onchange", onChange);
      input.addEventListener("onblur", onChange);
    }
  }
};

function render_custom_tile(canvas, tileId, renderer) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  renderer.render_tile(ctx, 0, 0, tileId);
};

function load_tile_set(renderer) {
  for (let i = 0; i < 36; i++) {
    const canvas = document.getElementById(`tile-${i+1}`);
    render_custom_tile(canvas, i, renderer);
    const inp = document.getElementById(`code-${i+1}`);
    inp.value = renderer.get_code(i);
  }
};

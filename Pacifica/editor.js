
function make_table(tileSize, renderer) {
  function handle_change(tileId, tileInput, tileCanvas) {
    renderer.set_tile(tileId, tileInput);
    render_tile(tileCanvas, tileId, renderer);
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
      /*
      br.height = 20;
      br.width = 100;
      br.style = "height: 8px;";
      const br2 = document.createElement("br");
      br2.style = "height: 8px;";
      cell.appendChild(br2);
      */
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
    }
  }
};

function render_tile(canvas, tileId, renderer) {
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  renderer.render_tile(ctx, 0, 0, tileId);
};

function load_tile_set(renderer, setId) {
  renderer.select_tiles(setId);
  for (let i = 0; i < 36; i++) {
    const canvas = document.getElementById(`tile-${i+1}`);
    render_tile(canvas, i, renderer);
    const inp = document.getElementById(`code-${i+1}`);
    inp.value = renderer.get_code(i);
  }
};

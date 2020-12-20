const CALIFORNIA = 0;
const FLAGS = 1;

// these need some work
const FLAG_CODES = [
  "\u{1F1E6}\u{1F1F2}", // Armenia
  "\u{1F1E6}\u{1F1F7}", // Argentina
  "\u{1F1E6}\u{1F1FA}", // Australia
  "\u{1F1E6}\u{1F1FF}", // Azerbaijan
//  "\u{1F1E7}\u{1F1EB}", // Burkina Faso
  "\u{1F1E7}\u{1F1F7}", // Brazil
  "\u{1F1E8}\u{1F1E6}", // Canada
  "\u{1F1E8}\u{1F1EC}", // Congo
  "\u{1F1E8}\u{1F1ED}", // Switzerland
  "\u{1F1E8}\u{1F1F1}", // Chile
  "\u{1F1E8}\u{1F1F3}", // China
  "\u{1F1F9}\u{1F1FC}", // Taiwan
  "\u{1F1E8}\u{1F1F7}", // Costa Rica
  "\u{1F1E8}\u{1F1FA}", // Cuba
  "\u{1F1E9}\u{1F1EA}", // Germany
  "\u{1F1E9}\u{1F1F0}", // Denmark
  "\u{1F1E9}\u{1F1F2}", // Dominica
  "\u{1F1EA}\u{1F1F8}", // Spain
  "\u{1F1EB}\u{1F1EE}", // Finland
  "\u{1F1EB}\u{1F1F7}", // France
  "\u{1F1EC}\u{1F1E7}", // United Kingdom
//  "\u{1F1EC}\u{1F1EA}", // Georgia
  "\u{1F1EC}\u{1F1F7}", // Greece
  "\u{1F1EE}\u{1F1EA}", // Ireland
  "\u{1F1EE}\u{1F1F1}", // Israel
  "\u{1F1EE}\u{1F1F3}", // India
  "\u{1F1EE}\u{1F1F9}", // Italy
  "\u{1F1EF}\u{1F1F2}", // Jamaica
  "\u{1F1EF}\u{1F1F5}", // Japan
//  "\u{1F1F0}\u{1F1ED}", // Cambodia
  "\u{1F1F0}\u{1F1F7}", // South Korea
  "\u{1F1F2}\u{1F1FD}", // Mexico
  "\u{1F1F3}\u{1F1EC}", // Nigeria
//  "\u{1F1F3}\u{1F1F4}", // Norway
  "\u{1F1F5}\u{1F1F0}", // Pakistan
  "\u{1F1F7}\u{1F1FA}", // Russia
  "\u{1F1F8}\u{1F1EA}", // Sweden
//  "\u{1F1F9}\u{1F1EC}", // Togo
  "\u{1F1F9}\u{1F1FF}", // Tanzania
  "\u{1F1FA}\u{1F1F8}", // United States
  "\u{1F1FB}\u{1F1EA}", // Venezuela
  "\u{1F1FF}\u{1F1E6}", // South Africa
];

function renderer(tileSize) {
  const images = [];
  for (let i = 1; i <= 36; i++) {
    const tileImg = new Image();
    tileImg.src = `tiles/tile${i}.jpg`;
    images.push(tileImg);
  }

  function render_unicode(ctx, x, y, charString, color) {
    ctx.save();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x, y, tileSize, tileSize);
    ctx.restore();
    ctx.save();
    const fontSize = Math.max(24, Math.floor(tileSize * 0.75));
    ctx.font = `${fontSize}pt Monaco`;
    ctx.beginPath();
    ctx.textAlign = "center";
    ctx.textBaseline = "hanging";
    if (color !== undefined) {
      ctx.fillStyle = color;
    }
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

  function render_tile(ctx, x, y, tileId, tileSet) {
    switch (tileSet) {
      case CALIFORNIA:
        render_image(ctx, x, y, tileId);
        break;
      case FLAGS:
        render_unicode(ctx, x, y, FLAG_CODES[tileId]);
        break;
    }
  };
  return render_tile;
};

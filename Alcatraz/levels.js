/** this code is in the public domain
  *
  */

function get_levels() {

  function to_color(h, s, l) {
    // XXX how is performance vs. hexstring?
    return `hsl(${h}, ${s*100}%, ${l*100}%)`
  };

  function get_random_color() {
    const hue = Math.random(); //get_random_hue();
    return to_color(Math.floor(hue*360), 1.0, 0.5);
  };

  function make_rainbow_colors(bricks) {
    return bricks.map((b) => get_random_color());
  };

  // testing level
  function make_bricks_0() {
    const width = 200;
    const height = 100;
    const bricks = [];
  //  const brick_colors = [];
    for (let i = 0; i < 7; i++) {
      for (let j = 0; j < 2; j++) {
        bricks.push([100 + (i*width), 800 - (j*height), width, height]);
      }
    }
    return {
      "paddle_width": 0.4,
      "ball_radius": 16,
      "bricks": bricks,
      "brick_colors": make_rainbow_colors(bricks)
    };
  };

  function make_bricks_1() {
    const width = 100;
    const height = 50;
    const bricks = [];
    for (let i = 0; i < 14; i++) {
      for (let j = 0; j < 7; j++) {
        bricks.push([100 + (i*width), 900 - (j*height), width, height]);
      }
    }
    return {
      "paddle_width": 0.3,
      "ball_radius": 12,
      "bricks": bricks,
      "brick_colors": make_rainbow_colors(bricks)
    };
  };

  function make_bricks_2() {
    const width = 100;
    const height = 20;
    const bricks = [];
    const brick_colors = [];
    for (let i = 0; i < 14; i++) {
      for (let j = 0; j < 20; j++) {
        bricks.push([width + (i*width), 900 - (j*height), width, height]);
        brick_colors.push(to_color((j/20)*100, 1.0, 0.5));
      }
    }
    return {
      "paddle_width": 0.25,
      "ball_radius": 10,
      "bricks": bricks,
      "brick_colors": brick_colors
    };
  };

  return [
    make_bricks_0(), // this is really just for testing
    make_bricks_1(),
    make_bricks_2()
  ];
};

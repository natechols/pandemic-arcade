function get_levels() {

  // these are totally random google search results
  const LEVELS = [
    // a very simple test of layout
    [
      "(=====)",
      "|....X|",
      "|.(=).|",
      "|.(=).|",
      "|@...$|",
      "(=====)"
    ],
    [
      // http://labs.phaser.io/assets/games/pacman/maze.png
      "(============)(============)",
      "|............||............|",
      "|.(==).(===).||.(===).(==).|",
      "|$|  |.|   |.||.|   |.|  |$|",
      "|.(==).(===).().(===).(==).|",
      "|..........................|",
      "|.(==).().(======).().(==).|",
      "|.(==).||.(==)(==).||.(==).|",
      "|......||....||....||......|",
      "(====).|(==) || (==)|.(====)",
      "     |.|(==) () (==)|.|     ",
      "     |.||          ||.|     ",
      "     |.|| (=----=) ||.|     ",
      "=====).() |      | ().(=====",
      "   @  .   | X X  |   .      ",
      "=====).() |  X X | ().(=====",
      "     |.|| (======) ||.|     ",
      "     |.||          ||.|     ",
      "     |.|| (======) ||.|     ",
      "(====).() (==)(==) ().(====)",
      "|............||............|",
      "|.(==).(===).||.(===).(==).|",
      "|.(=)|.(===).().(===).|(=).|",
      "|$..||.......  .......||..$|",
      "(=).||.().(======).().||.(=)",
      "(=).().||.(==)(==).||.().(=)",
      "|......||....||....||......|",
      "|.(====)(==).||.(==)(====).|",
      "|.(========).().(========).|",
      "|..........................|",
      "(==========================)"
    ]
  ];
  
  // returns Array[Array[Char]]
  function get_level(idx) {
    if (idx < LEVELS.length) {
      return LEVELS[idx].map((s) => s.split(''));
    } else {
      return null;
    }
  };
  return get_level;
};

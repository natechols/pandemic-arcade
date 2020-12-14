
function get_layout() {

function to_row(a, j) {
  return a.map((i) => [i, j]);
}

const TEST_LAYOUT = [
  [ [1, 1], [2, 1], [3, 1], [4, 1],
    [1, 2], [2, 2], [3, 2], [4, 2],
    [2, 3], [3, 3] ],
  [ [2, 1.5], [3, 1.5] ]
];

// https://en.wikipedia.org/wiki/Mahjong_solitaire
const TURTLE = [
  // bottom layer
  // the order of rows is important here to avoid edge overlap artifacts
  [
    ...to_row([1,2,3,4,5,6,7,8,9,10,11,12], 0),
    ...to_row([3,4,5,6,7,8,9,10], 1),
    ...to_row([2,3,4,5,6,7,8,9,10,11], 2),
    ...to_row([0], 3.5),
    ...to_row([1,2,3,4,5,6,7,8,9,10,11,12], 3),
    ...to_row([1,2,3,4,5,6,7,8,9,10,11,12], 4),
    ...to_row([13, 14], 3.5),
    ...to_row([2,3,4,5,6,7,8,9,10,11], 5),
    ...to_row([3,4,5,6,7,8,9,10], 6),
    ...to_row([1,2,3,4,5,6,7,8,9,10,11,12], 7)
  ],
  [
    ...to_row([4,5,6,7,8,9], 1),
    ...to_row([4,5,6,7,8,9], 2),
    ...to_row([4,5,6,7,8,9], 3),
    ...to_row([4,5,6,7,8,9], 4),
    ...to_row([4,5,6,7,8,9], 5),
    ...to_row([4,5,6,7,8,9], 6)
  ],
  [
    ...to_row([5,6,7,8], 2),
    ...to_row([5,6,7,8], 3),
    ...to_row([5,6,7,8], 4),
    ...to_row([5,6,7,8], 5)
  ],
  [
    ...to_row([6,7], 3),
    ...to_row([6,7], 4)
  ],
  [
    [6.5, 3.5]
  ]
];

// https://www.youtube.com/watch?v=7ASKJIFVK2A
const MOMBASA = [
  [
    ...to_row([1.5, 2.5, 6, 7, 8, 9, 10, 11], 0),
    ...to_row([1, 2, 3, 6, 7, 8, 9, 10, 11], 1),
    ...to_row([6, 7, 8, 9, 10, 11], 2),
    ...to_row([2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 3),
    ...to_row([2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 4),
    ...to_row([2, 3, 4, 5, 6, 7], 5),
    ...to_row([2, 3, 4, 5, 6, 7, 10, 11, 12], 6),
    ...to_row([2, 3, 4, 5, 6, 7, 10.5, 11.5], 7)
  ],
  [
    ...to_row([6.5, 7.5, 8.5, 9.5, 10.5], 0.5),
    ...to_row([6.5, 7.5, 8.5, 9.5, 10.5], 1.5),
    ...to_row([6.5, 7.5, 8.5, 9.5, 10.5], 2.5),
    ...to_row([2.5, 3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5, 10.5], 3.5),
    ...to_row([2.5, 3.5, 4.5, 5.5, 6.5], 4.5),
    ...to_row([2.5, 3.5, 4.5, 5.5, 6.5], 5.5),
    ...to_row([2.5, 3.5, 4.5, 5.5, 6.5], 6.5)
  ],
  [
    ...to_row([6.5, 7.5, 8.5, 9.5], 1.5),
    ...to_row([6.5, 7.5, 8.5, 9.5], 2.5),
    ...to_row([3.5, 4.5, 5.5, 6.5, 7.5, 8.5, 9.5], 3.5),
    ...to_row([3.5, 4.5, 5.5, 6.5], 4.5),
    ...to_row([3.5, 4.5, 5.5, 6.5], 5.5)
  ],
  [
    ...to_row([7, 8, 9], 2),
    ...to_row([7, 8, 9], 3),
    ...to_row([4, 5, 6], 4),
    ...to_row([4, 5, 6], 5)
  ],
  [
    ...to_row([8, 9], 2),
    ...to_row([4, 5], 5)
  ]
];

return [TURTLE, MOMBASA][Math.floor(Math.random() * 1.5)];
};
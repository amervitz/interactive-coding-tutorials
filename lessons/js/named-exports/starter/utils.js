// Named exports - export multiple values
export const PI = 3.14159;
export const E = 2.71828;

export function circleArea(radius) {
  return PI * radius * radius;
}

export function circleCircumference(radius) {
  return 2 * PI * radius;
}

// Can also export all at once:
// export { PI, E, circleArea, circleCircumference };
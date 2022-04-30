import { canvasJp } from "canvas-jp";
import { angle } from "canvas-jp/angle";
import { CanvasJpArc, Circle } from "canvas-jp/Circle";
import { Color } from "canvas-jp/Color";
import { distance } from "canvas-jp/distance";
import { inOutSine } from "canvas-jp/ease";
import { CanvasJpPoint, Point } from "canvas-jp/Point";
import { translateVector } from "canvas-jp/transform";
import { mapRange } from "canvas-sketch-util/math";

const width = 1200;
const height = 1200;
const frames = 100;

let palette = [
  Color(214 / 360, 0.52, 0.5),
  Color(180 / 360, 0.1, 0.65),
  Color(5 / 360, 0.6, 0.93),
  Color(40 / 360, 0.66, 1),
  Color(37 / 360, 0.18, 0.99),
];

canvasJp(
  document.querySelector("#container"),
  async function (t, frame, random) {
    const margin = width / 10;

    // Elements variables
    const numberOfElements = Math.ceil(
      mapRange(random.value(), 0, 1, 100, 500)
    );
    const length = mapRange(
      Math.pow(random.value(), 2),
      0,
      1,
      width / 4,
      width / 12
    );
    const initialWidth = mapRange(
      random.value(),
      0,
      1,
      width / 100,
      width / 20
    );

    // Deformation of the positions. If everything is at 0, it should be a
    // perfect circle
    const flowFieldZoom = mapRange(random.value(), 0, 1, 600, 1200);
    const circleDeformationStrength = mapRange(random.value(), 0, 1, 0, 2);
    const sinusoidalDeformationFrequence = mapRange(random.value(), 0, 1, 0, 2);
    const sinusoidalDeformationStrength = mapRange(
      random.value(),
      0,
      1,
      0,
      0.01
    );

    // Control over the colors
    // Gradient precision defines how smooth the gradient should be.
    const gradientPrecision = mapRange(
      Math.pow(random.value(), 5),
      0,
      1,
      1,
      15
    );
    const isMulticolor = random.value() > 0.3;
    const colorDirection =
      random.value() > 0.9
        ? (progress) => progress
        : (progress) => 1 - progress;

    const mainColor = random.pick(palette);
    const secondColor = random.pick(
      palette.filter((color) => color !== mainColor)
    );

    const center = Point(width / 2, height / 2);

    // One element is kind of one brush stroke. It starts big, grows smaller
    // and changes its color on its course.
    function makeElement(
      length: number,
      startPoint: CanvasJpPoint,
      initialWidth: number
    ) {
      const endColor = mainColor;
      const startColor = isMulticolor
        ? random.pick(palette.filter((color) => color !== endColor))
        : secondColor;

      // If two points have the same exact position, we still want to apply some
      // kind of offset on its deformation. If we don't, it makes things a bit too
      // stiff.
      const offsetFlow = Point(
        random.gaussian(0, width / 50),
        random.gaussian(0, width / 50)
      );

      // Number of circles used to draw the gradient (each element is just a
      // bunch of circles with different sizes and colors)
      const numberOfCircles = Math.ceil(length / gradientPrecision);
      const distanceBetweenCircles = length / numberOfCircles;

      const element: Array<CanvasJpArc> = [];
      let initialPosition = startPoint;
      for (let index = 0; index < numberOfCircles; index++) {
        // Progress 0 => first circle, 1 => last circle
        // the easing makes the shapes a bit more organic.
        const progress = inOutSine(index / (numberOfCircles - 1));

        // This first flow field is a way to apply some "wave" deformation on
        // each stroke.
        // It was the first idea behind this sketch, but meh, didn't really work.
        // So it's strength was strongly reduced :)
        const currentAngle = angle(center, initialPosition);
        const mainFlowFieldRandom =
          random.noise2D(
            sinusoidalDeformationFrequence * Math.cos(currentAngle),
            sinusoidalDeformationFrequence * Math.sin(currentAngle)
          ) *
          length *
          sinusoidalDeformationStrength;

        // This second flowfield adds a global deformation to the sphere
        const flowField =
          random.noise2D(
            (initialPosition.x + offsetFlow.x) / flowFieldZoom,
            (initialPosition.y + offsetFlow.y) / flowFieldZoom
          ) *
          length *
          circleDeformationStrength;

        const direction = angle(center, initialPosition) + Math.PI / 2;

        // Moving the circle normally to its next position
        initialPosition = translateVector(
          distanceBetweenCircles,
          direction,
          initialPosition
        );

        // then apply the deformations
        const positionWithMainFlowField = translateVector(
          mainFlowFieldRandom,
          angle(center, initialPosition),
          initialPosition
        );
        const positionWithSmallFlowField = translateVector(
          flowField,
          angle(center, initialPosition),
          positionWithMainFlowField
        );

        element.push(
          Circle(positionWithSmallFlowField, initialWidth * (1 - progress), {
            color: Color.mix(startColor, endColor, colorDirection(progress)),
            opacity: 1,
          })
        );
      }

      return element;
    }

    const grid = [];

    // Draw many elements. Position them on a sphere randomly. Once projected on a
    // 2D plan, it makes the center less dense than the outside
    for (let pointIndex = 0; pointIndex < numberOfElements; pointIndex++) {
      const sphereRadius = width / 2 - length - margin;
      const [x, y] = random.onSphere(sphereRadius);
      const elementCenter = Point(x + center.x, y + center.y);

      // Change some base parameters based on the position of the element.
      // If it's far from the center, make it smaller.
      const distanceFromCenter = distance(center, elementCenter);
      const progress = distanceFromCenter / sphereRadius;

      const element = makeElement(
        length * progress * random.gaussian(1, 0.1),
        elementCenter,
        initialWidth * progress * random.gaussian(1, 0.1)
      );

      grid.push({ element: element, position: distanceFromCenter });
    }

    // Draw the outer elements first. This helps creating some sort of depth feeling
    grid.sort((a, b) => a.position - b.position);

    return {
      background: mainColor,
      elements: [].concat(grid.map(({ element }) => element).flat()),
    };
  },
  {
    width: width,
    height: height,
    resolution: 1,
    title: "Wave",
    animation: false,
    numberOfFrames: frames,
    loop: false,
    exportSketch: false,
    embed: false,
    interactive: false,
  }
);

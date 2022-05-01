import { canvasJp } from "canvas-jp";
import { angle } from "canvas-jp/angle";
import { CanvasJpArc, Circle } from "canvas-jp/Circle";
import { Color } from "canvas-jp/Color";
import { distance } from "canvas-jp/distance";
import { inOutSine, inSine } from "canvas-jp/ease";
import { CanvasJpPoint, Point } from "canvas-jp/Point";
import { translateVector } from "canvas-jp/transform";
import { mapRange, clamp } from "canvas-sketch-util/math";

const width = 1200;
const height = (width / 21) * 29.7;
const frames = 100;

let colorPalette = [
  Color(214 / 360, 0.52, 0.5),
  Color(180 / 360, 0.1, 0.65),
  Color(5 / 360, 0.6, 0.93),
  Color(40 / 360, 0.66, 1),
  Color(37 / 360, 0.18, 0.99),
];

let blackAndWhitePalette = [Color(0, 0, 1), Color(0, 0, 0.2)];

function draw() {
  canvasJp(
    document.querySelector("#container"),
    async function (t, frame, random) {
      const margin = width / 10;

      // Elements variables
      const numberOfElements = Math.ceil(
        mapRange(random.value(), 0, 1, 420, 850)
      );
      const initialWidth = mapRange(
        random.value(),
        0,
        1,
        width / 75,
        width / 40
      );
      const length = clamp(
        initialWidth,
        initialWidth * 30,
        random.gaussian(initialWidth * 15, initialWidth * 3)
      );
      const elementDirection =
        random.value() > 0.3 ? 0 : ((random.value() - 0.5) * Math.PI) / 2;
      const placement = random.pick([
        placeElementCircle,
        placeElementWave,
        //   placeElementGrid,
      ]);
      const directionFunction = random.pick(
        [
          directionConcentric,
          [placeElementCircle, placeElementGrid].includes(placement)
            ? null
            : directionFlat,
        ].filter(Boolean)
      );

      // Deformation of the positions. If everything is at 0, it should be a
      // perfect circle
      const flowFieldZoom = mapRange(random.value(), 0, 1, width / 2, width);
      const circleDeformationStrength = mapRange(random.value(), 0, 1, 0, 2);
      const sinusoidalDeformationFrequence = mapRange(
        random.value(),
        0,
        1,
        20,
        30
      );
      const sinusoidalDeformationStrength =
        directionFunction === directionFlat && random.value() > 0.5
          ? mapRange(random.value(), 0, 1, 0.06, 0.1)
          : 0;

      // Control over the colors
      // Gradient precision defines how smooth the gradient should be.
      const gradientPrecision = mapRange(
        Math.pow(random.value(), 18),
        0,
        1,
        0.8,
        12
      );
      const palette = random.pick([
        colorPalette,
        colorPalette,
        colorPalette,
        colorPalette,
        colorPalette,
        colorPalette,
        colorPalette,
        colorPalette,
        colorPalette,
        blackAndWhitePalette,
      ]);
      const isMulticolor = random.value() > 0.3;
      const colorDirection =
        random.value() > 0.5
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
          const progress =
            index < numberOfCircles / 4
              ? inSine(1 - index / (numberOfCircles / 4))
              : inOutSine(
                  (index - numberOfCircles / 4) /
                    ((numberOfCircles / 4) * 3 - 1)
                );
          const colorProgress = inOutSine(index / (numberOfCircles - 1));

          // This first flow field is a way to apply some "wave" deformation on
          // each stroke.
          // It was the first idea behind this sketch, but meh, didn't really work.
          // So it's strength was strongly reduced :)
          const currentAngle = angle(center, initialPosition);
          const clampingMax =
            placement === placeElementWave
              ? sinusoidalDeformationStrength
              : sinusoidalDeformationStrength / 2;
          const mainFlowFieldRandom = clamp(
            -length * clampingMax,
            length * clampingMax,
            random.noise2D(
              sinusoidalDeformationFrequence * Math.cos(currentAngle),
              sinusoidalDeformationFrequence * Math.sin(currentAngle)
            ) *
              length *
              sinusoidalDeformationStrength
          );

          // This second flowfield adds a global deformation to the sphere
          const flowField =
            random.noise2D(
              (initialPosition.x + offsetFlow.x) / flowFieldZoom,
              (initialPosition.y + offsetFlow.y) / flowFieldZoom
            ) *
            length *
            circleDeformationStrength;

          // Angle tangent to the circle
          const direction = directionFunction(initialPosition);

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
          const positionWithSmallFlowField =
            placeElementGrid === placement
              ? translateVector(
                  flowField / 2,
                  angle(center, initialPosition),
                  positionWithMainFlowField
                )
              : translateVector(
                  flowField,
                  angle(center, initialPosition),
                  positionWithMainFlowField
                );

          element.push(
            Circle(positionWithSmallFlowField, initialWidth * (1 - progress), {
              color: Color.mix(
                startColor,
                endColor,
                colorDirection(colorProgress)
              ),
              opacity: 1,
            })
          );
        }

        return element;
      }

      const directionCenter =
        random.value() < 0.75
          ? center
          : Point(
              ((random.value() - 0.5) * width) / 3 + width / 2,
              ((random.value() - 0.5) * height) / 3 + height / 2
            );
      function directionConcentric(initialPosition: CanvasJpPoint) {
        return (
          angle(directionCenter, initialPosition) +
          Math.PI / 2 -
          elementDirection
        );
      }

      const flatDirection = random.value() * Math.PI * 2;
      function directionFlat(initialPosition: CanvasJpPoint) {
        return flatDirection;
      }

      function placeElementCircle() {
        const inSphere = true;
        random.value() > 0.1;
        const sphereRadius = width / 2 - margin;
        const circleRadius = (width / 3) * 2;
        const circleAngle = mapRange(random.value(), 0, 1, 0, Math.PI * 2);
        const circleDistance = mapRange(
          sphereRadius,
          circleRadius,
          random.value()
        );
        const [x, y] = inSphere
          ? random.onSphere(sphereRadius)
          : [
              circleDistance * Math.cos(circleAngle),
              circleDistance * Math.sin(circleAngle),
            ];
        const elementCenter = Point(x + center.x, y + center.y);

        // Change some base parameters based on the position of the element.
        // If it's far from the center, make it smaller.
        const distanceFromCenter = distance(center, elementCenter);
        const progress = distanceFromCenter / sphereRadius;
        return {
          progress: clamp(0, 2, random.gaussian(progress, 0.05)),
          elementCenter,
          distanceFromCenter: clamp(
            0,
            1,
            random.gaussian(distanceFromCenter, 0.2)
          ),
        };
      }

      function placeElementWave() {
        const elementCenter = Point(
          random.value() * (width - margin * 2) + margin,
          random.value() * (height - margin * 2) + margin
        );
        const distanceFromCenter = distance(center, elementCenter);
        const progress = 1 - distanceFromCenter / (width / 2);
        return {
          progress: clamp(0, 1, random.gaussian(progress, 0.2)),
          elementCenter,
          distanceFromCenter: clamp(
            0,
            1,
            random.gaussian(distanceFromCenter, 0.2)
          ),
        };
      }

      const gridSpacingModifier = mapRange(random.value(), 0, 1, 0.6, 1);
      function placeElementGrid(index: number) {
        const numberOfElementsPerRow = Math.round(
          Math.sqrt(numberOfElements) * gridSpacingModifier
        );
        const gridSpacing =
          (width - margin * 2 - length) / numberOfElementsPerRow;

        const x = index % numberOfElementsPerRow;
        const y = Math.floor(index / numberOfElementsPerRow);

        if (
          y * numberOfElementsPerRow + numberOfElementsPerRow >
          numberOfElements * gridSpacingModifier * gridSpacingModifier
        ) {
          return;
        }

        const elementCenter = Point(
          x * gridSpacing + margin + length / 2,
          y * gridSpacing + margin + length / 2
        );

        return {
          progress: clamp(0, 1, random.gaussian(0.75, 0.2)),
          elementCenter,
          distanceFromCenter: 1,
        };
      }

      const grid = [];

      // Draw many elements. Position them on a sphere randomly. Once projected on a
      // 2D plan, it makes the center less dense than the outside
      for (let pointIndex = 0; pointIndex < numberOfElements; pointIndex++) {
        const placementResult = placement(pointIndex);
        if (!placementResult) {
          continue;
        }
        const { progress, elementCenter, distanceFromCenter } = placementResult;
        const element = makeElement(
          length * progress * clamp(0, 3, random.gaussian(1, 0.1)),
          elementCenter,
          initialWidth * progress * clamp(0, 3, random.gaussian(1, 0.3))
        );

        grid.push({ element: element, position: distanceFromCenter });
      }

      // Draw the outer elements first. This helps creating some sort of depth feeling
      if (directionFunction !== directionFlat) {
        grid.sort((a, b) => a.position - b.position);
      }

      return {
        background: mainColor,
        elements: [].concat(grid.map(({ element }) => element).flat()),
      };
    },
    {
      width: width,
      height: height,
      resolution: 2,
      title: "Wave",
      animation: false,
      numberOfFrames: frames,
      loop: false,
      exportSketch: true,
      embed: true,
      interactive: false,
    }
  );
}

draw();

window.addEventListener("click", async () => {
  document.querySelector("#container").innerHTML = "";
  await draw();
});

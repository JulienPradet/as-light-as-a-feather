import { canvasJp } from "canvas-jp";
import { angle } from "canvas-jp/angle";
import { CanvasJpArc, Circle } from "canvas-jp/Circle";
import { CanvasJpColorHsv, Color } from "canvas-jp/Color";
import { distance } from "canvas-jp/distance";
import {
  inBounce,
  inCirc,
  inCube,
  inOutBounce,
  inOutSine,
  inQuart,
  inSine,
} from "canvas-jp/ease";
import { CanvasJpPoint, Point } from "canvas-jp/Point";
import { PolygonFromRect } from "canvas-jp/Polygon";
import { translateVector } from "canvas-jp/transform";
import { mapRange, clamp } from "canvas-sketch-util/math";

const width = 1200;
const height = (width / 21) * 29.7;
const frames = 100;

const palette = [
  Color(214 / 360, 0.52, 0.5),
  Color(180 / 360, 0.1, 0.65),
  Color(5 / 360, 0.6, 0.93),
  Color(40 / 360, 0.66, 1),
  Color(37 / 360, 0.18, 0.99), // this one must be last for psychedelic
];

const white = Color(0, 0, 1);
const black = Color(0, 0, 0.2);
let blackAndWhitePalette = [white, black];

let timeToDraw = 5000;
function getTimeToDraw() {
  return timeToDraw;
}

async function draw() {
  document.querySelector("#container").innerHTML = "";

  return canvasJp(
    document.querySelector("#container"),
    function* (t, frame, random) {
      const margin = width / 10;

      // Elements variables
      let numberOfElements = Math.ceil(
        mapRange(random.value(), 0, 1, 420, 850)
      );
      let initialWidth = mapRange(random.value(), 0, 1, width / 75, width / 40);
      const length = clamp(
        initialWidth,
        initialWidth * 30,
        random.gaussian(initialWidth * 15, initialWidth * 3)
      );
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

      // Control over the colors
      // Gradient precision defines how smooth the gradient should be.
      const gradientPrecision = mapRange(
        Math.pow(random.value(), 18),
        0,
        1,
        0.8,
        12
      );

      function blackAndWhite() {
        const mainColor = random.pick(blackAndWhitePalette);
        const secondColor = random.pick(
          blackAndWhitePalette.filter((color) => color !== mainColor)
        );
        return {
          name: "black&white",
          getBackgroundColor: () => mainColor,
          getMainColor: () => mainColor,
          getSecondColor: (mainColor: CanvasJpColorHsv) => secondColor,
        };
      }

      function monochrome() {
        const mainColor = random.pick(palette);
        const secondColor = random.pick(
          palette.filter((color) => color !== mainColor)
        );
        return {
          name: "monochrome",
          getBackgroundColor: () => mainColor,
          getMainColor: () => mainColor,
          getSecondColor: (mainColor: CanvasJpColorHsv) => secondColor,
        };
      }

      function multicolor() {
        const mainColor = random.pick(palette);
        return {
          name: "multicolor",
          getBackgroundColor: () => mainColor,
          getMainColor: () => mainColor,
          getSecondColor: (mainColor: CanvasJpColorHsv) =>
            random.pick(palette.filter((color) => color !== mainColor)),
        };
      }

      function psychedelic() {
        return {
          name: "psychedelic",
          getBackgroundColor: () => palette[palette.length - 1],
          getMainColor: () => random.pick(palette),
          getSecondColor: (mainColor: CanvasJpColorHsv) =>
            random.pick(palette.filter((color) => color !== mainColor)),
        };
      }

      const colorPickerFactory = random.pick(
        []
          .concat(blackAndWhite)
          .concat(new Array(5).fill(monochrome))
          .concat(new Array(14).fill(multicolor))
          .concat(psychedelic)
      );
      const colorPicker = colorPickerFactory();
      const backgroundColor = colorPicker.getBackgroundColor();

      const colorDirection =
        random.value() > 0.5
          ? (progress) => progress
          : (progress) => 1 - progress;

      // Deformation of the positions. If everything is at 0, it should be a
      // perfect circle
      let flowFieldZoom = mapRange(random.value(), 0, 1, width / 2, width);
      const deformationClamp = 0.6;
      let circleDeformationStrength = clamp(
        deformationClamp,
        Number.MAX_SAFE_INTEGER,
        random.value() < 0.02
          ? mapRange(Math.pow(random.value(), 0.3), 0, 1, 2, 10)
          : mapRange(Math.pow(random.value(), 1.7), 0, 1, 0, 2)
      );
      if (circleDeformationStrength === deformationClamp) {
        circleDeformationStrength = mapRange(random.value(), 0, 1, 0, 0.1);
      }

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

      if (sinusoidalDeformationStrength > 0) {
        circleDeformationStrength *= 0.7;
      }

      const center = Point(width / 2, height / 2);

      // One element is kind of one brush stroke. It starts big, grows smaller
      // and changes its color on its course.
      function makeElement(
        length: number,
        startPoint: CanvasJpPoint,
        initialWidth: number
      ) {
        const endColor = colorPicker.getMainColor();
        const startColor = colorPicker.getSecondColor(endColor);

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

      let elementDirection =
        random.value() > 0.6 ? 0 : ((random.value() - 0.5) * Math.PI) / 2;
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

      const inSphereThreshold = circleDeformationStrength > 1 ? 0.05 : 0.18;
      function placeElementCircle(index: number) {
        const inSphere = random.value() > inSphereThreshold;

        const sphereRadius = width / 2 - margin;
        const circleRadius = sphereRadius + margin * 5;
        const circleAngle = mapRange(random.value(), 0, 1, 0, Math.PI * 2);
        const circleDistance = mapRange(
          Math.pow(random.value(), 2.5),
          0,
          1,
          sphereRadius,
          circleRadius
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
        const progress = inSphere
          ? distanceFromCenter / sphereRadius
          : 1 -
            (distanceFromCenter - sphereRadius) / (circleRadius - sphereRadius);
        return {
          progress: clamp(
            0,
            2,
            random.gaussian(inSphere ? Math.sqrt(progress) : progress / 2, 0.05)
          ),
          elementCenter,
          distanceFromCenter: clamp(
            0,
            1,
            random.gaussian(
              inSphere ? distanceFromCenter : distanceFromCenter / 2,
              0.2
            )
          ),
        };
      }

      function placeElementWave(index: number) {
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

      console.log("===========");
      console.table({
        Seed: random.getSeed(),
        Color: colorPicker.name,
        Placement: placement.name,
        Direction: directionFunction.name,
        "Direction phase": elementDirection,
        "Number of elements": numberOfElements,
        Length: length,
        initialWidth: initialWidth,
        Zoom: flowFieldZoom,
        Deformation: circleDeformationStrength,
        Shaker: sinusoidalDeformationStrength,
      });

      //   if (
      //     placement === placeElementCircle &&
      //     directionFunction === directionConcentric
      //   ) {
      //     if (circleDeformationStrength < 0.8) {
      //       circleDeformationStrength *= 1.3;
      //     }
      //     if (flowFieldZoom > 1000) {
      //       flowFieldZoom *= 0.7;
      //     }
      //   }

      const cadreWidth = margin / 6;
      const cadre = [
        PolygonFromRect(0, 0, width, margin / 6).toShape({
          color: backgroundColor,
          opacity: 1,
        }),
        PolygonFromRect(0, 0, margin / 6, height).toShape({
          color: backgroundColor,
          opacity: 1,
        }),
        PolygonFromRect(0, height - margin / 6, width, margin / 6).toShape({
          color: backgroundColor,
          opacity: 1,
        }),
        PolygonFromRect(width - margin / 6, 0, margin / 6, height).toShape({
          color: backgroundColor,
          opacity: 1,
        }),
      ];

      const progressBarColor = Color.mix(
        backgroundColor,
        colorPicker.getSecondColor(backgroundColor),
        0.55
      );
      const progressBarWidth = clamp(1, cadreWidth, Math.round(cadreWidth / 4));
      function progressBar(progress) {
        return cadre.concat([
          // bottom left -> top left
          PolygonFromRect(0, 0, progressBarWidth, height * progress).toShape({
            color: progressBarColor,
            opacity: 1,
          }),
          // top left -> top right
          PolygonFromRect(
            0,
            height - progressBarWidth,
            width * progress,
            progressBarWidth
          ).toShape({
            color: progressBarColor,
            opacity: 1,
          }),
          // top right -> bottom right
          PolygonFromRect(
            width - progressBarWidth,
            height * (1 - progress),
            progressBarWidth,
            height * progress
          ).toShape({
            color: progressBarColor,
            opacity: 1,
          }),

          // top left -> top right
          PolygonFromRect(
            width * (1 - progress),
            0,
            width * progress,
            progressBarWidth
          ).toShape({
            color: progressBarColor,
            opacity: 1,
          }),
        ]);
      }

      yield {
        background: backgroundColor,
        elements: progressBar(0),
      };

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

      //   let elementsToRender = [];
      //   for (let { element } of grid) {
      //     elementsToRender.push(element);

      //     if (elementsToRender.length > 2) {
      //       const elementsToDraw = [].concat(elementsToRender);
      //       elementsToRender = [];
      //       yield {
      //         background: null,
      //         elements: elementsToDraw.flat(),
      //       };
      //     }
      //   }

      const numberOfElementsToDrawApproximation = grid
        .map(({ element }) => element.length)
        .reduce((acc, length) => acc + length, 0);

      let numberOfRenderedElements = 0;
      let elementsToRender = [];
      for (let { element } of grid) {
        for (let item of element) {
          elementsToRender.push(item);
          numberOfRenderedElements++;

          const numberOfElementsPerFrame =
            (numberOfElementsToDrawApproximation / getTimeToDraw()) * 16.6;
          if (elementsToRender.length > numberOfElementsPerFrame) {
            yield {
              background: null,
              elements: elementsToRender.concat(
                progressBar(
                  1 -
                    numberOfRenderedElements /
                      numberOfElementsToDrawApproximation
                )
              ),
            };
            elementsToRender = [];
          }
        }
      }

      yield {
        background: null,
        elements: cadre,
      };
    },
    {
      width: width,
      height: height,
      resolution: clamp(1, 1.5, window.devicePixelRatio || 1),
      title: "Wave",
      animation: false,
      numberOfFrames: frames,
      loop: false,
      exportSketch: false,
      embed: true,
      interactive: false,
    }
  );
}

draw();

window.addEventListener("click", async () => {
  draw();
});

window.addEventListener("keydown", (event) => {
  if (event.key === "+") {
    timeToDraw = Math.max(2000, timeToDraw - 5000);
  } else if (["-", "6"].includes(event.key)) {
    timeToDraw = timeToDraw + 5000;
  } else if (["<", "?"].includes(event.key)) {
    alert(
      `Hey! Julien Pradet speaking. Nice to meet you! You can find me at https://twitter.com/JulienPradet".
Shortcuts:
- "Space" to load a new one
- "+" to speed up the pace
- "-" to slow down the pace
- "?" to display this alert
`
    );
  } else if ([" "].includes(event.key)) {
    draw();
  }
});

import { canvasJp, CanvasJpDrawable, CanvasJpStrokeStyle } from "canvas-jp";
import { angle } from "canvas-jp/angle";
import { CanvasJpArc, Circle } from "canvas-jp/Circle";
import { CanvasJpColorHsv, Color, Gradient, red } from "canvas-jp/Color";
import { distance } from "canvas-jp/distance";
import {
  inBounce,
  inCirc,
  inCube,
  inOutBounce,
  inOutSine,
  inQuart,
  inSine,
  outSine,
} from "canvas-jp/ease";
import { Line } from "canvas-jp/Line";
import { CanvasJpPoint, Point } from "canvas-jp/Point";
import { PolygonFromRect } from "canvas-jp/Polygon";
import { CanvasJpShape } from "canvas-jp/Shape";
import { rotate, translate, translateVector } from "canvas-jp/transform";
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

const white = Color(0, 0, 0.99);
const black = Color(0, 0, 0.2);
let blackAndWhitePalette = [white, black];

let timeToDraw = 5000;
function getTimeToDraw() {
  return timeToDraw;
}

async function draw() {
  document.querySelector("#container").innerHTML = "";

  await canvasJp(
    document.querySelector("#container"),
    function* (t, frame, random) {
      const margin = width / 10;

      const mode = random.pick(
        new Array(80)
          .fill("normal")
          .concat(["tiny", "rowdy", "rowdy", "rowdy", "rowdy"])
      );

      // Elements variables
      let numberOfElements = Math.ceil(
        mapRange(random.value(), 0, 1, 420, 850)
      );
      if (mode === "rowdy") {
        numberOfElements = Math.ceil(numberOfElements / 2);
      }
      if (mode === "tiny") {
        numberOfElements *= 3;
      }
      let initialWidth =
        mode === "tiny"
          ? mapRange(random.value(), 0, 1, width / 150, width / 200)
          : mapRange(random.value(), 0, 1, width / 60, width / 30);

      let length = clamp(
        initialWidth,
        initialWidth * 30,
        random.gaussian(initialWidth * 12, initialWidth * 5)
      );
      const placement = random.pick([
        placeElementCircle,
        placeElementWave,
        //   placeElementGrid,
      ]);

      const shouldUseFlatDirection = [
        placeElementCircle,
        placeElementGrid,
      ].includes(placement);
      const directionFunction = random.pick(
        []
          .concat(
            new Array(shouldUseFlatDirection ? 10 : 20).fill(
              directionConcentric
            )
          )
          .concat(
            shouldUseFlatDirection ? new Array(10).fill(directionFlat) : null
          )
          .concat(directionRandom)
          .filter(Boolean)
      );

      if (directionFunction === directionRandom && length > initialWidth * 6) {
        length /= 3;
      }

      let latestComputedDirectionPosition = null;
      let latestDirectionOffset = null;
      function directionRandom(
        initialPosition: CanvasJpPoint,
        usedCenter: CanvasJpPoint,
        startPoint: CanvasJpPoint
      ) {
        if (latestComputedDirectionPosition !== startPoint) {
          latestComputedDirectionPosition = startPoint;
          latestDirectionOffset = distance(usedCenter, startPoint) * 0.004;
        }
        return (
          random.noise2D(
            latestDirectionOffset +
              distance(initialPosition, startPoint) * 0.002,
            latestDirectionOffset
          ) * Math.PI
        );
      }

      // Control over the colors
      // Gradient precision defines how smooth the gradient should be.
      const gradientPrecision = mapRange(
        Math.pow(random.value(), 18),
        0,
        1,
        0.8,
        12
      );
      const gradientRoughness = mapRange(
        Math.pow(random.value(), 3),
        0,
        1,
        0,
        0.17
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

      function dual() {
        const mainColor = random.pick(palette);
        const remainingColors = palette.filter((color) => color !== mainColor);
        const mainSecondColor = random.pick(remainingColors);
        const amountOfMainSecondColor = Math.round(random.gaussian(6, 1.5));

        const glitchBaseColor = random.pick([white, black, black, black]);

        const dualGlitchColor = Color.mix(
          Color(
            (mainColor.h + mainSecondColor.h) / 2,
            glitchBaseColor.s,
            glitchBaseColor.v
          ),
          mainColor,
          0.9
        );

        const secondColors = new Array(amountOfMainSecondColor)
          .fill(null)
          .map(() => mainSecondColor)
          .concat([
            amountOfMainSecondColor > 7 && random.value() > 0.05
              ? random.pick(
                  remainingColors.filter((color) => color !== mainSecondColor)
                )
              : null,
          ]);

        return {
          name: "monochrome",
          getBackgroundColor: () => mainColor,
          getProgressBarColor: () => mainSecondColor,
          getMainColor: () => mainColor,
          getSecondColor: (mainColor: CanvasJpColorHsv) =>
            random.pick(secondColors),
          getGlitchColor: () => dualGlitchColor,
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
          .concat(new Array(3).fill(monochrome))
          .concat(new Array(4).fill(dual))
          .concat(new Array(12).fill(multicolor))
          .concat(psychedelic)
      );
      const colorPicker = colorPickerFactory();
      const backgroundColor = colorPicker.getBackgroundColor();
      const hasNoGradient = random.value() < 0.05;

      const hasReversedColorDirection = random.value() > 0.8;
      const colorLinearity = mapRange(random.value(), 0, 1, 0.4, 1);

      const colorMixer = random.pick(
        []
          .concat(new Array(250).fill(Color.mix))
          .concat(new Array(250).fill(oppositeMix))
          .concat(randomMix)
      );

      function oppositeMix(
        colorA: CanvasJpColorHsv,
        colorB: CanvasJpColorHsv,
        factor: number
      ) {
        let hueA = colorA.h;
        let hueB = colorB.h;
        if (hueA - hueB > 0.2) {
          hueB += 1;
        } else if (hueB - hueA > 0.2) {
          hueA += 1;
        }
        return Color(
          (hueA * factor + hueB * (1 - factor)) % 1,
          colorA.s * factor + colorB.s * (1 - factor),
          colorA.v * factor + colorB.v * (1 - factor)
        );
      }
      function randomMix(
        colorA: CanvasJpColorHsv,
        colorB: CanvasJpColorHsv,
        factor: number
      ) {
        return random.pick([Color.mix, oppositeMix])(colorA, colorB, factor);
      }

      const colorMixerAmplified = (colorA, colorB, factor) => {
        const factorAmplified = Math.pow(
          factor,
          hasReversedColorDirection ? colorLinearity : 1 / colorLinearity
        );
        return colorMixer(colorA, colorB, factorAmplified);
      };

      const colorDirection = hasReversedColorDirection
        ? (progress) => progress
        : (progress) => 1 - progress;

      const hasVariableSize = random.value() < 0.03;

      // Deformation of the positions. If everything is at 0, it should be a
      // perfect circle
      let flowFieldZoom = mapRange(random.value(), 0, 1, width / 2, width);
      const deformationClamp = 0.6;
      let circleDeformationStrength = clamp(
        deformationClamp,
        Number.MAX_SAFE_INTEGER,
        random.value() < 0.02
          ? mapRange(Math.pow(random.value(), 0.3), 0, 1, 2, 10)
          : mode === "tiny"
          ? mapRange(Math.pow(random.value(), 1.7), 0, 1, 0.4, 4)
          : mapRange(Math.pow(random.value(), 1.7), 0, 1, 0.4, 2)
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

      const transformElement = random.pick(
        new Array(32)
          .fill(identity)
          .concat(
            new Array(3)
              .fill([
                random.value() < 0.2 && circleDeformationStrength < 2
                  ? symetry
                  : null,
                line,
                sinusoidalDeformationStrength < 0.7 ? stripe : null,
              ])
              .flat()
          )
          .concat([transformBorder])
          .filter(Boolean)
      );
      if (transformElement === symetry) {
        numberOfElements /= 4;
      }

      const center =
        random.value() > 0.2
          ? Point(
              mapRange(random.value(), 0, 1, 0.2, 0.8) * width,
              mapRange(random.value(), 0, 1, 0.2, 0.8) * height
            )
          : Point(width / 2, height / 2);

      const maxDistance =
        Math.max(
          distance(Point(0, 0), center),
          distance(Point(width, 0), center),
          distance(Point(width, height), center),
          distance(Point(0, height), center)
        ) * clamp(0.4, 2, random.gaussian(0.7, 0.4));

      const alternativeCenters = new Array(
        random.value() > 0.8
          ? Math.round(
              clamp(0, Number.MAX_SAFE_INTEGER, Math.abs(random.gaussian(0, 2)))
            )
          : 0
      )
        .fill(null)
        .map((_, index) => {
          let alternativeCenter;
          let attempt = 1000;
          do {
            alternativeCenter = Point(
              mapRange(random.value(), 0, 1, 0.15, 0.85) * width,
              mapRange(random.value(), 0, 1, 0.15, 0.85) * height
            );
            attempt--;
          } while (
            distance(center, alternativeCenter) <
              Math.min(maxDistance * 0.8, height / 2) &&
            attempt > 0
          );
          return alternativeCenter;
        })
        .filter(Boolean);

      if (alternativeCenters.length > 0) {
        initialWidth *= 0.9;
      }

      const allCenters = new Array(4).fill(center).concat(alternativeCenters);
      const allDistances = allCenters.map((currentCenter) => {
        if (currentCenter === center) {
          return maxDistance * 0.7;
        } else {
          return maxDistance * clamp(0.3, 0.6, random.gaussian(0.45, 0.2));
        }
      });

      // One element is kind of one brush stroke. It starts big, grows smaller
      // and changes its color on its course.
      function makeElement(
        length: number,
        startPoint: CanvasJpPoint,
        initialWidth: number,
        indexProgress: number,
        usedCenter: CanvasJpPoint
      ) {
        if (random.value() < 0.5) {
          const multiplier = mapRange(random.value(), 0, 1, 1, 2.5);
          length /= multiplier;
          initialWidth /= multiplier;
        } else if (indexProgress < 0.2 && random.value() < 0.05) {
          const multiplier = mapRange(
            random.value(),
            0,
            1,
            1,
            mode === "tiny" ? 1.5 : 2
          );
          length *= multiplier;
          initialWidth *= multiplier;
        }

        const isEraser = random.value() > (hasNoGradient ? 0.7 : 0.95);
        const endColor = isEraser
          ? backgroundColor
          : colorPicker.getMainColor();
        const startColor = isEraser
          ? backgroundColor
          : colorPicker.getSecondColor(endColor);
        const opacityBreakpoint = random.gaussian(0.6, 0.05);
        const opacityOffset = random.value() * 10000;

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
          const currentAngle = angle(usedCenter, initialPosition);
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
          const direction = directionFunction(
            initialPosition,
            usedCenter,
            startPoint
          );

          // Moving the circle normally to its next position
          initialPosition = translateVector(
            distanceBetweenCircles,
            direction,
            initialPosition
          );

          // then apply the deformations
          const positionWithMainFlowField = translateVector(
            mainFlowFieldRandom,
            angle(usedCenter, initialPosition),
            initialPosition
          );
          const positionWithSmallFlowField =
            placeElementGrid === placement
              ? translateVector(
                  flowField / 2,
                  angle(usedCenter, initialPosition),
                  positionWithMainFlowField
                )
              : translateVector(
                  flowField,
                  angle(usedCenter, initialPosition),
                  positionWithMainFlowField
                );

          const sizeRandomness =
            mode === "rowdy"
              ? clamp(
                  0,
                  Number.MAX_SAFE_INTEGER,
                  mapRange(random.noise1D(progress * 100), -0.5, 0.5, 1, 3)
                )
              : hasVariableSize
              ? clamp(
                  0,
                  1,
                  mapRange(
                    random.noise1D(
                      (clamp(0, 1, progress) * length) / 5 + opacityOffset
                    ),
                    -1,
                    1,
                    0.1,
                    0.6
                  )
                )
              : 1;

          element.push(
            Circle(
              positionWithSmallFlowField,
              initialWidth * (1 - progress) * sizeRandomness,
              {
                color: hasNoGradient
                  ? startColor || colorPicker.getGlitchColor()
                  : startColor && endColor
                  ? colorMixerAmplified(
                      startColor,
                      endColor,
                      colorDirection(
                        clamp(
                          0,
                          1,
                          random.gaussian(colorProgress, gradientRoughness)
                        )
                      )
                    )
                  : colorPicker.getGlitchColor(),
                opacity:
                  colorProgress > opacityBreakpoint
                    ? inSine(
                        mapRange(colorProgress, opacityBreakpoint, 1, 1, 0)
                      )
                    : mode === "rowdy"
                    ? 0.8
                    : 1,
              }
            )
          );
        }

        return element;
      }

      const directionCenter =
        random.value() < 0.85
          ? center
          : Point(
              mapRange(random.value(), 0, 1, 0.3, 0.7) * width,
              mapRange(random.value(), 0, 1, 0.3, 0.7) * height
            );

      let elementDirection =
        random.value() > 0.6 ? 0 : ((random.value() - 0.5) * Math.PI) / 2;
      function directionConcentric(
        initialPosition: CanvasJpPoint,
        usedCenter: CanvasJpPoint
      ) {
        return (
          angle(
            directionCenter === center ? usedCenter : directionCenter,
            initialPosition
          ) +
          Math.PI / 2 -
          elementDirection
        );
      }

      const flatDirection = random.value() * Math.PI * 2;
      function directionFlat(initialPosition: CanvasJpPoint) {
        return flatDirection;
      }

      const inSphereThreshold = circleDeformationStrength > 1 ? 0.05 : 0.3;

      function placeElementCircle(index: number) {
        const centerIndex = Math.floor(random.value() * allCenters.length);
        const usedCenter = allCenters[centerIndex];
        const maxDistance = allDistances[centerIndex];

        const inSphere =
          random.value() > inSphereThreshold / (usedCenter === center ? 1 : 2);

        const sphereRadius = Math.min(width * 0.65, maxDistance) - margin;
        const circleRadius = sphereRadius + margin * 3;
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
        const elementCenter = Point(x + usedCenter.x, y + usedCenter.y);

        // Change some base parameters based on the position of the element.
        // If it's far from the center, make it smaller.
        const distanceFromCenter = distance(usedCenter, elementCenter);

        let closestCenter = usedCenter;
        let maxDistanceFromCenters = distanceFromCenter;
        for (let centerItem of allCenters) {
          let distanceFromCenter = distance(centerItem, elementCenter);
          if (distanceFromCenter < maxDistanceFromCenters) {
            maxDistanceFromCenters = distanceFromCenter;
            closestCenter = centerItem;
          }
        }

        const progress = inSphere
          ? maxDistanceFromCenters / sphereRadius
          : 1 -
            (maxDistanceFromCenters - sphereRadius) /
              (circleRadius - sphereRadius);

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
              inSphere ? maxDistanceFromCenters : maxDistanceFromCenters / 2,
              0.2
            )
          ),
          usedCenter: closestCenter,
        };
      }

      function placeElementWave(index: number) {
        const elementCenter = Point(
          random.value() * (width - margin * 2) + margin,
          random.value() * (height - margin * 2) + margin
        );
        const distanceFromCenter = distance(center, elementCenter);
        const progress = 1 - distanceFromCenter / maxDistance;
        return {
          progress: clamp(0, 1, random.gaussian(progress, 0.2)),
          elementCenter,
          distanceFromCenter: clamp(
            0,
            1,
            random.gaussian(distanceFromCenter, 0.2)
          ),
          usedCenter: center,
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

      function identity(element) {
        return element;
      }

      const symetryAngle = (random.value() * Math.PI) / 2;
      const symetryCenter = Point(width / 2, height / 2);
      function symetry(elements: CanvasJpArc[]) {
        return elements.concat(
          elements.map((element) => {
            const elementAngle = angle(symetryCenter, element.center);
            const elementDistance = distance(symetryCenter, element.center);
            return Circle(
              translateVector(
                0,
                symetryAngle,
                translateVector(
                  elementDistance,
                  elementAngle + Math.PI,
                  symetryCenter
                )
              ),
              element.radius,
              element.fill
            );
          })
        );
      }

      function line(elements: CanvasJpArc[]): CanvasJpDrawable[] {
        return [].concat(elements).concat(
          elements
            .map((element, index) => {
              const prevElement = elements[index > 0 ? index - 1 : 0];
              const progress =
                index < elements.length * 0.2
                  ? inSine(mapRange(index, 0, elements.length * 0.2, 0, 1))
                  : index > elements.length * 0.8
                  ? outSine(
                      mapRange(
                        index,
                        elements.length * 0.8,
                        elements.length,
                        1,
                        0
                      )
                    )
                  : 1;
              return Line(prevElement.center, element.center, {
                color: element.fill.color,
                opacity: 1,
                width: element.radius * 0.3 * progress,
                style: CanvasJpStrokeStyle.round,
              });
            })
            .slice(1, -1)
        );
      }

      const useOnlyBaseRotation = random.value() < 0.2;
      const rotationOffset =
        random.value() * (useOnlyBaseRotation ? Math.PI : Math.PI * 0.4);
      const lengthFactor = useOnlyBaseRotation
        ? 1
        : clamp(0, 5, 1 / Math.cos(rotationOffset));
      const baseSpacing = random.gaussian(width / 150, width / 200);
      function stripe(elements: CanvasJpArc[]): CanvasJpDrawable[] {
        let prevElement = elements[0];
        return [].concat(
          elements
            .map((element, index) => {
              if (
                distance(prevElement.center, element.center) <
                baseSpacing + random.gaussian(0, width / 200)
              ) {
                return;
              }

              const tangent =
                (useOnlyBaseRotation
                  ? 0
                  : angle(prevElement.center, element.center) + Math.PI / 2) +
                random.gaussian(0, 0.05);

              prevElement = element;

              return Line(
                rotate(
                  element.center,
                  rotationOffset,
                  translateVector(
                    element.radius * lengthFactor,
                    tangent,
                    element.center
                  )
                ),
                rotate(
                  element.center,
                  rotationOffset,
                  translateVector(
                    -element.radius * lengthFactor,
                    tangent,
                    element.center
                  )
                ),
                {
                  color: element.fill.color,
                  opacity: element.fill.opacity,
                  style: CanvasJpStrokeStyle.round,
                  width: width / 300,
                }
              );
            })
            .filter(Boolean)
            .slice(1, -1)
        );
      }

      function transformBorder(elements: CanvasJpArc[]) {
        const threshold = clamp(
          1,
          Number.MAX_SAFE_INTEGER,
          Math.round(elements.length * 0.05)
        );
        return elements.concat(
          elements.slice(threshold, -threshold).map((element) => {
            return Circle(element.center, element.radius * 0.8, {
              color: backgroundColor,
              opacity: 0.08,
            });
          })
        );
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
        Transform: transformElement.name,
        mode: mode,
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

      const cadreWidth = Math.round(width / 400);
      const cadreColor = backgroundColor;
      const cadre = [
        PolygonFromRect(0, 0, width, cadreWidth).toShape({
          color: cadreColor,
          opacity: 1,
        }),
        PolygonFromRect(0, 0, cadreWidth, height).toShape({
          color: cadreColor,
          opacity: 1,
        }),
        PolygonFromRect(0, height - cadreWidth, width, cadreWidth).toShape({
          color: cadreColor,
          opacity: 1,
        }),
        PolygonFromRect(width - cadreWidth, 0, cadreWidth, height).toShape({
          color: cadreColor,
          opacity: 1,
        }),
      ];

      const progressBarColor = colorMixerAmplified(
        backgroundColor,
        colorPicker.getSecondColor(backgroundColor) ||
          colorPicker.getProgressBarColor(),
        0.55
      );
      const progressBarWidth = width / 400;
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

      const background = PolygonFromRect(0, 0, width, height).toShape({
        opacity: 1,
        color: backgroundColor,
      });

      yield {
        background: backgroundColor,
        elements: [].concat(background).concat(progressBar(0)),
        //   .concat(
        //     allCenters
        //       .map((center, index) => [
        //         Circle(center, allDistances[index], { color: red, opacity: 1 }),
        //         Circle(center, 5, {
        //           color: black,
        //           opacity: 1,
        //         }),
        //       ])
        //       .flat()
        //   ),
      };

      const grid = [];

      // Draw many elements. Position them on a sphere randomly. Once projected on a
      // 2D plan, it makes the center less dense than the outside
      for (let pointIndex = 0; pointIndex < numberOfElements; pointIndex++) {
        const placementResult = placement(pointIndex);
        if (!placementResult) {
          continue;
        }
        const { progress, elementCenter, distanceFromCenter, usedCenter } =
          placementResult;

        const element = makeElement(
          length * progress * clamp(0, 3, random.gaussian(1, 0.1)),
          elementCenter,
          initialWidth * progress * clamp(0, 3, random.gaussian(1, 0.3)),
          pointIndex / numberOfElements,
          usedCenter
        );

        grid.push({
          element: transformElement(element),
          position: distanceFromCenter,
        });
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

  function granulate() {
    const canvas = document.querySelector("canvas");
    const context = document.querySelector("canvas").getContext("2d");
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      let grainAmount = (Math.random() - 0.5) * 15;
      imageData.data[i] = imageData.data[i] + grainAmount;
      imageData.data[i + 1] = imageData.data[i + 1] + grainAmount;
      imageData.data[i + 2] = imageData.data[i + 2] + grainAmount;
      imageData.data[i + 3] = imageData.data[i + 3] + grainAmount;
    }

    context.putImageData(imageData, 0, 0, 0, 0, canvas.width, canvas.height);
  }
  //   granulate();
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

/* global fxhash */

import { canvasJp, CanvasJpDrawable, CanvasJpStrokeStyle } from "canvas-jp";
import { angle } from "canvas-jp/angle";
import { CanvasJpArc, Circle } from "canvas-jp/Circle";
import { CanvasJpColorHsv, Color } from "canvas-jp/Color";
import { distance } from "canvas-jp/distance";
import { inOutSine, inSine, outSine } from "canvas-jp/ease";
import { Line } from "canvas-jp/Line";
import { CanvasJpPoint, Point } from "canvas-jp/Point";
import { PolygonFromRect } from "canvas-jp/Polygon";
import { Shape, SmoothShape } from "canvas-jp/Shape";
import { translate } from "canvas-jp/transform";
import { rotate, translateVector } from "canvas-jp/transform";
import { mapRange, clamp } from "canvas-sketch-util/math";

let width = 1200;
let height = (width / 21) * 29.7;
const windowRatio = window.innerWidth / window.innerHeight;
const imageRatio = width / height;
const resolutionFactor =
  windowRatio > imageRatio
    ? window.innerHeight / height
    : window.innerWidth / width;
const resolution = clamp(1, 2, window.devicePixelRatio || 1) * resolutionFactor;

const firstPaletteColors = {
  darkBlue: Color(214 / 360, 0.56, 0.5),
  greyBlue: Color(178 / 360, 0.15, 0.65),
  red: Color(5 / 360, 0.6, 0.92),
  yellow: Color(41 / 360, 0.64, 1),
  beige: Color(37 / 360, 0.17, 0.99), // this one must be last for psychedelic
};

const white = Color(0, 0, 0.99);
const black = Color(0, 0, 0.23);
let blackAndWhitePalette = [white, black];

let defaultTimeToDraw = 4000;
let timeToDraw = defaultTimeToDraw;
let timeAuto = true;
function getTimeToDraw() {
  return timeToDraw;
}

async function draw({
  forceSeed,
  save = null,
  animate = true,
}: { forceSeed?: number; animate?: boolean; save?: string | null } = {}) {
  timeToDraw = defaultTimeToDraw;
  document.querySelector("#container").innerHTML = "";

  await canvasJp(
    document.querySelector("#container"),
    function* (random) {
      if (forceSeed) {
        random.setSeed(forceSeed);
      }
      const margin = width / 10;
      const waveMargin = width / 16;

      const palette = random.pick([Object.values(firstPaletteColors)]);

      const mode = random.pick(new Array(80).fill("Normal").concat(["Tiny"]));

      // Elements variables
      let numberOfElements = Math.ceil(
        mapRange(Math.pow(random.value(), 1.8), 0, 1, 450, 800)
      );
      if (mode === "Tiny") {
        numberOfElements *= 3;
      }
      let initialWidth =
        mode === "Tiny"
          ? mapRange(random.value(), 0, 1, width / 150, width / 200)
          : mapRange(
              Math.pow(random.value(), 1.5),
              0,
              1,
              width / 65,
              width / 35
            );

      let length = clamp(
        initialWidth * 1,
        initialWidth * 30,
        random.gaussian(initialWidth * 16, initialWidth * 5)
      );
      if (length < initialWidth * 3 && random.value() > 0.1) {
        length *= 3;
      }
      const placement = random.pick([
        placeElementCircle,
        placeElementCircle,
        placeElementCircle,
        placeElementCircle,
        placeElementCircle,
        placeElementCircle,
        placeElementCircle,
        placeElementCircle,
        placeElementWave,
        placeElementWave,
        placeElementRandom,
        placeElementGrid,
        placeElementGrid,
      ]);

      if (placement === placeElementWave) {
        numberOfElements *= 0.6;
      }

      // Deformation of the positions. If everything is at 0, it should be a
      // perfect circle
      let flowFieldZoom = mapRange(random.value(), 0, 1, width / 2, width);
      const deformationClamp = 0.6;
      let circleDeformationStrength = clamp(
        deformationClamp,
        Number.MAX_SAFE_INTEGER,
        random.value() < 0.02
          ? mapRange(Math.pow(random.value(), 0.3), 0, 1, 2, 10)
          : mode === "Tiny"
          ? mapRange(Math.pow(random.value(), 1.5), 0, 1, 0.4, 4)
          : mapRange(Math.pow(random.value(), 1.5), 0, 1, 0.4, 2)
      );
      if (circleDeformationStrength === deformationClamp) {
        circleDeformationStrength = mapRange(random.value(), 0, 1, 0, 0.1);
      }

      const shouldUseFlatDirection = [
        placeElementCircle,
        placeElementGrid,
      ].includes(placement);
      const directionFunction = random.pick(
        []
          .concat(
            new Array(shouldUseFlatDirection ? 75 : 150).fill(
              directionConcentric
            )
          )
          .concat(
            shouldUseFlatDirection
              ? new Array(circleDeformationStrength > 1 ? 45 : 6).fill(
                  directionFlat
                )
              : null
          )
          .concat(placement === placeElementGrid ? [] : [directionFlowField])
          .concat(directionRandom)
          .filter(Boolean)
      );

      if (directionFunction === directionRandom && length > initialWidth * 6) {
        initialWidth *= 2.5;
        length = Math.min(
          length / 1.5,
          initialWidth * mapRange(random.value(), 0, 1, 2, 4)
        );
      }

      if (directionFunction === directionRandom && numberOfElements > 500) {
        numberOfElements *= 0.6;
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
      directionRandom.fxname = "Random";

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

      // Control over the colors
      // Gradient precision defines how smooth the gradient should be.
      const gradientPrecision = mapRange(
        Math.pow(random.value(), 18),
        0,
        1,
        0.8,
        circleDeformationStrength > 1
          ? 4
          : sinusoidalDeformationStrength > 0
          ? 1
          : 12
      );
      if (gradientPrecision > 7) {
        length *= 1.5;
      }

      const gradientRoughness = mapRange(
        Math.pow(random.value(), 3),
        0,
        1,
        0,
        0.17
      );

      const colorMixer = random.pick(
        []
          .concat(new Array(10).fill(Color.mix))
          .concat(new Array(10).fill(oppositeMix))
          .concat(
            gradientPrecision < 1 &&
              circleDeformationStrength < 1.5 &&
              sinusoidalDeformationStrength === 0 &&
              directionFunction !== directionRandom
              ? [randomMix]
              : []
          )
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
      blackAndWhite.fxname = "Black & White";

      const excludedPalettes = [
        {
          mixer: oppositeMix,
          mainColor: firstPaletteColors.red,
          excludedChoices: [
            firstPaletteColors.greyBlue,
            firstPaletteColors.darkBlue,
          ],
        },
        {
          mixer: oppositeMix,
          mainColor: firstPaletteColors.yellow,
          excludedChoices: [firstPaletteColors.greyBlue],
        },
        {
          mainColor: firstPaletteColors.yellow,
          excludedChoices: [firstPaletteColors.beige],
        },
        {
          mixer: oppositeMix,
          mainColor: firstPaletteColors.greyBlue,
          excludedChoices: [
            firstPaletteColors.red,
            firstPaletteColors.yellow,
            firstPaletteColors.beige,
          ],
        },
        {
          mixer: Color.mix,
          mainColor: firstPaletteColors.greyBlue,
          excludedChoices: [firstPaletteColors.red],
        },
        {
          mixer: Color.mix,
          mainColor: firstPaletteColors.red,
          excludedChoices: [
            firstPaletteColors.greyBlue,
            firstPaletteColors.yellow,
            firstPaletteColors.darkBlue,
          ],
        },
      ].filter(({ mixer }) => !mixer || colorMixer === mixer);

      function getRemainingPalette(mainColor: CanvasJpColorHsv) {
        const excludedColors =
          excludedPalettes.find((item) => item.mainColor === mainColor)
            ?.excludedChoices || [];
        return palette
          .filter((color) => excludedColors.every((item) => item !== color))
          .filter((color) => color !== mainColor);
      }

      function dual() {
        const mainColor = random.pick(
          palette.filter((color) => getRemainingPalette(color).length > 0)
        );
        const remainingColors = getRemainingPalette(mainColor);
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
          .fill(mainSecondColor)
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
          getSecondColor: (mainColor: CanvasJpColorHsv, progress) =>
            progress < 0.8 ? random.pick(secondColors) : mainSecondColor,
          getGlitchColor: () => dualGlitchColor,
        };
      }
      dual.fxname = "Dual";

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
      multicolor.fxname = "Multicolor";

      const darkBackground = Color(270 / 360, 0.53, 0.1);

      function multicolorDarkBackground() {
        const mainColor = darkBackground;
        return {
          name: "multicolor",
          getBackgroundColor: () => mainColor,
          getMainColor: () => mainColor,
          getSecondColor: (mainColor: CanvasJpColorHsv) =>
            random.pick(palette.filter((color) => color !== mainColor)),
        };
      }

      multicolorDarkBackground.fxname = "Dark";

      function psychedelic() {
        return {
          name: "psychedelic",
          getBackgroundColor: () => palette[palette.length - 1],
          getMainColor: () => random.pick(palette),
          getSecondColor: (mainColor: CanvasJpColorHsv) =>
            random.pick(palette.filter((color) => color !== mainColor)),
        };
      }

      psychedelic.fxname = "Psychedelic";

      function psychedelicDark() {
        return {
          name: "psychedelic",
          getBackgroundColor: () => darkBackground,
          getMainColor: () => random.pick(palette),
          getSecondColor: (mainColor: CanvasJpColorHsv) =>
            random.pick(palette.filter((color) => color !== mainColor)),
        };
      }
      psychedelicDark.fxname = "Dark Psychedelic";

      const colorPickerFactory =
        colorMixer === randomMix
          ? psychedelic
          : random.pick(
              []
                .concat(blackAndWhite)
                // .concat(new Array(4).fill(monochrome))
                .concat(new Array(6).fill(dual))
                .concat(new Array(16).fill(multicolor))
                .concat(new Array(1).fill(multicolorDarkBackground))
                .concat(psychedelic)
                .concat(psychedelic)
                .concat(psychedelicDark)
            );

      const colorPicker = colorPickerFactory();
      const backgroundColor = colorPicker.getBackgroundColor();
      const hasNoGradient = random.value() < 0.05;

      const hasReversedColorDirection = random.value() > 0.8;
      const colorLinearity = mapRange(random.value(), 0, 1, 0.6, 1);

      const isDarkBackground = [
        psychedelicDark,
        multicolorDarkBackground,
      ].includes(colorPickerFactory);
      const threshold = isDarkBackground ? 0.4 : 0.2;

      Color.mix.fxname = "Default";

      function oppositeMix(
        colorA: CanvasJpColorHsv,
        colorB: CanvasJpColorHsv,
        factor: number
      ) {
        let hueA = colorA.h;
        let hueB = colorB.h;
        if (hueA - hueB > threshold) {
          hueB += 1;
        } else if (hueB - hueA > threshold) {
          hueA += 1;
        }
        return Color(
          (hueA * factor + hueB * (1 - factor)) % 1,
          colorA.s * factor + colorB.s * (1 - factor),
          colorA.v * factor + colorB.v * (1 - factor)
        );
      }
      oppositeMix.fxname = "Opposite";

      function randomMix(
        colorA: CanvasJpColorHsv,
        colorB: CanvasJpColorHsv,
        factor: number
      ) {
        return random.pick([Color.mix, oppositeMix])(colorA, colorB, factor);
      }
      randomMix.fxname = "Glitch";

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

      const transformElement = random.pick(
        new Array(25)
          .fill(identity)
          .concat(
            new Array(15).fill(
              sinusoidalDeformationStrength < 0.05 &&
                gradientPrecision < 1.5 &&
                gradientRoughness < 0.04
                ? tranformShape
                : null
            )
          )
          .concat(
            new Array(3)
              .fill([
                random.value() < 0.2 &&
                circleDeformationStrength < 2 &&
                placement !== placeElementRandom
                  ? symmetry
                  : null,

                line,

                sinusoidalDeformationStrength < 0.05 &&
                gradientPrecision < 1.5 &&
                colorMixer !== randomMix &&
                length / 3 > initialWidth
                  ? stripe
                  : null,

                circleDeformationStrength < 0.7 &&
                length > initialWidth * 5 &&
                sinusoidalDeformationStrength === 0 &&
                !hasNoGradient
                  ? transformClouds
                  : null,
              ])
              .flat()
          )
          .concat([transformBorder])
          .filter(Boolean)
      );

      if (transformElement === symmetry) {
        numberOfElements /= 4;
      } else if (transformElement === stripe) {
        if (length < width / 10 || length < initialWidth * 8) {
          length = clamp(
            initialWidth * 12,
            initialWidth * 30,
            random.gaussian(initialWidth * 16, initialWidth * 5)
          );
        }
      }

      const centerRandom = random.value();
      let center: CanvasJpPoint =
        centerRandom > 0.15
          ? Point(
              mapRange(random.value(), 0, 1, 0.3, 0.7) * width,
              mapRange(random.value(), 0, 1, 0.3, 0.7) * height
            )
          : centerRandom > 0.14
          ? Point(
              mapRange(random.value(), 0, 1, 0, waveMargin),
              mapRange(random.value(), 0, 1, 0, height)
            )
          : centerRandom > 0.13
          ? Point(
              mapRange(random.value(), 0, 1, 0, width),
              mapRange(random.value(), 0, 1, 0, waveMargin)
            )
          : centerRandom > 0.12
          ? Point(
              mapRange(random.value(), 0, 1, width - waveMargin, width),
              mapRange(random.value(), 0, 1, 0, height)
            )
          : centerRandom > 0.11
          ? Point(
              mapRange(random.value(), 0, 1, 0, waveMargin),
              mapRange(random.value(), 0, 1, height - waveMargin, height)
            )
          : Point(width / 2, height / 2);

      let maxDistance =
        Math.max(
          distance(Point(0, 0), center),
          distance(Point(width, 0), center),
          distance(Point(width, height), center),
          distance(Point(0, height), center)
        ) *
        clamp(
          0.55,
          placement === placeElementWave ? 0.75 : 1.7,
          random.gaussian(0.65, 0.25)
        );

      if (
        ((centerRandom < 0.15 && centerRandom > 0.11) ||
          (centerRandom > 0.15 && random.value() > 0.1)) &&
        placement === placeElementCircle
      ) {
        maxDistance *= 3;

        if (distance(Point(width / 2, height / 2), center) < width / 4) {
          const translationAngle =
            angle(Point(width / 2, height / 2), center) +
            ((random.value() - 0.5) * Math.PI) / 2;
          const newCenter = translateVector(
            (mapRange(random.value(), 0, 1, 0.5, 0.7) * maxDistance) / 5,
            translationAngle,
            center
          );
          center = newCenter;
        }
      }

      if (
        centerRandom < 0.26 &&
        placement === placeElementCircle &&
        circleDeformationStrength < 1.5 &&
        directionFunction === directionFlat
      ) {
        maxDistance *= 1.5;
      }

      const alternativeCenters = new Array(
        random.value() > 0.9 && circleDeformationStrength < 1
          ? Math.round(clamp(0, 3, Math.abs(random.gaussian(0, 2))))
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

      const mainCenterProbability = 4;
      const allCenters = new Array(mainCenterProbability)
        .fill(center)
        .concat(alternativeCenters);
      const allDistances = allCenters.map((currentCenter) => {
        if (currentCenter === center) {
          return maxDistance * 0.7;
        } else {
          return maxDistance * clamp(0.3, 0.6, random.gaussian(0.45, 0.2));
        }
      });

      if (
        allDistances[0] < width / 3 &&
        allDistances.length === mainCenterProbability
      ) {
        numberOfElements /= 2;
      }

      function darkenIfDarkBackground(color: CanvasJpColorHsv) {
        return isDarkBackground
          ? Color(color.h, color.s * 1.1, color.v * 0.93)
          : color;
      }

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
            mode === "Tiny" ? 1.5 : 2
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
          : colorPicker.getSecondColor(endColor, indexProgress);
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

          const sizeRandomness = hasVariableSize
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

          let opacity =
            colorProgress > opacityBreakpoint
              ? inSine(mapRange(colorProgress, opacityBreakpoint, 1, 1, 0))
              : 1;

          let color = hasNoGradient
            ? darkenIfDarkBackground(startColor || colorPicker.getGlitchColor())
            : startColor && endColor
            ? colorMixerAmplified(
                startColor,
                endColor,
                colorDirection(
                  clamp(0, 1, random.gaussian(colorProgress, gradientRoughness))
                )
              )
            : colorPicker.getGlitchColor();

          if (hasNoGradient && gradientRoughness > 0 && !isEraser) {
            color = Color(
              color.h,
              color.s,
              color.v * (1 - clamp(0, 1, random.gaussian(0, gradientRoughness)))
            );
          }

          element.push(
            Circle(
              positionWithSmallFlowField,
              initialWidth * (1 - progress) * sizeRandomness,
              {
                color: color,
                opacity: opacity,
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
      directionConcentric.fxname = "Void";

      const flatDirection = random.value() * Math.PI * 2;
      function directionFlat(initialPosition: CanvasJpPoint) {
        return flatDirection;
      }
      directionFlat.fxname = "Wind";

      const frequency = mapRange(random.value(), 0, 1, 5, 10);
      function directionFlowField(initialPosition: CanvasJpPoint) {
        return (
          random.noise2D(
            initialPosition.x / width / frequency,
            initialPosition.y / width / frequency
          ) *
          Math.PI *
          2
        );
      }
      directionFlowField.fxname = "Flow";

      const inSphereThreshold = circleDeformationStrength > 1 ? 0.05 : 0.3;

      function placeElementCircle(index: number) {
        const centerIndex = Math.floor(random.value() * allCenters.length);
        const usedCenter = allCenters[centerIndex];
        const maxDistanceForCurrentCenter = allDistances[centerIndex];

        const inSphere =
          random.value() > inSphereThreshold / (usedCenter === center ? 1 : 2);

        const sphereRadius =
          Math.min(width * 0.65, maxDistanceForCurrentCenter) - margin;
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

        let progress = inSphere
          ? maxDistanceFromCenters / sphereRadius
          : 1 -
            (maxDistanceFromCenters - sphereRadius) /
              (circleRadius - sphereRadius);

        progress = progress * (maxDistanceForCurrentCenter / maxDistance);

        if (
          directionFunction === directionFlat &&
          distanceFromCenter > sphereRadius * 0.5
        ) {
          if (
            random.value() >
            Math.pow(distanceFromCenter / circleDistance, 0.5) * 0.8
          ) {
            return;
          }
        }

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
      placeElementCircle.fxname = "Circle";

      let waveDirection = (progress) => Math.pow(progress, 0.8);
      function placeElementWave(index: number) {
        const elementCenter = Point(
          random.value() * (width - waveMargin * 2) + waveMargin,
          random.value() * (height - waveMargin * 2) + waveMargin
        );
        const distanceFromCenter = distance(center, elementCenter);
        const progress = 1 - distanceFromCenter / (maxDistance - waveMargin);
        return {
          progress: waveDirection(clamp(0, 1, random.gaussian(progress, 0.2))),
          elementCenter,
          distanceFromCenter: waveDirection(
            clamp(0, 1, random.gaussian(distanceFromCenter, 0.2))
          ),
          usedCenter: center,
        };
      }
      placeElementWave.fxname = "Gravity";

      function placeElementRandom() {
        const elementCenter = Point(
          random.value() * (width - waveMargin * 2) + waveMargin,
          random.value() * (height - waveMargin * 2) + waveMargin
        );

        const baseProgress = clamp(
          0,
          1,
          mapRange(
            random.noise2D(
              (elementCenter.x / width) * 4,
              (elementCenter.y / width) * 4
            ),
            -0.7,
            0.7,
            0.2,
            1
          ) + random.gaussian(0, 0.1)
        );

        return {
          progress: clamp(0, 1, random.gaussian(baseProgress, 0.1)),
          elementCenter,
          distanceFromCenter: clamp(0, 1, random.gaussian(0.5, 0.1)),
          usedCenter: center,
        };
      }
      placeElementRandom.fxname = "Random";

      const corners = [
        Point(waveMargin, waveMargin),
        Point(width - waveMargin, waveMargin),
        Point(width - waveMargin, height - waveMargin),
        Point(waveMargin, height - waveMargin),
      ];
      const gridSpacingModifier = mapRange(random.value(), 0, 1, 1, 1.5);
      if (placement === placeElementGrid && circleDeformationStrength < 1) {
        numberOfElements = numberOfElements * gridSpacingModifier;
      }
      const maxGridDistance = Math.max(
        ...corners.map((corner) => distance(corner, center))
      );

      const spacingRigidity = mapRange(
        Math.pow(random.value(), 2),
        0,
        1,
        0.25,
        0
      );
      function placeElementGrid(index: number) {
        const numberOfElementsPerRow = Math.round(Math.sqrt(numberOfElements));
        const gridSpacingColumns = width / numberOfElementsPerRow;
        const gridSpacingRows = height / numberOfElementsPerRow;

        const x = index % numberOfElementsPerRow;
        const y = Math.floor(index / numberOfElementsPerRow);

        // if (
        //   y * numberOfElementsPerRow + numberOfElementsPerRow >
        //   numberOfElements * gridSpacingModifier * gridSpacingModifier
        // ) {
        //   return;
        // }

        const flatDirectionOffset =
          directionFunction === directionFlat ? 0.75 * length : 0;

        const elementCenter = Point(
          x * gridSpacingColumns -
            (flatDirectionOffset * Math.cos(flatDirection)) / 2 +
            random.gaussian(0, gridSpacingColumns * spacingRigidity),
          y * gridSpacingRows -
            (flatDirectionOffset * Math.sin(flatDirection)) / 2 +
            random.gaussian(0, gridSpacingColumns * spacingRigidity)
        );

        return {
          progress: clamp(0, 1, random.gaussian(0.75, 0.2)),
          elementCenter,
          distanceFromCenter:
            distance(center, elementCenter) / maxGridDistance +
            random.gaussian(0, 0.3),
          usedCenter: center,
        };
      }
      placeElementGrid.fxname = "Grid";

      function identity(element) {
        return element;
      }
      identity.fxname = "Default";

      const symetryAngle = (random.value() * Math.PI) / 2;
      const symetryCenter = Point(width / 2, height / 2);
      function symmetry(elements: CanvasJpArc[]) {
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
      symmetry.fxname = "Symmetry";

      function line(elements: CanvasJpArc[]): CanvasJpDrawable[] {
        let prevElement = elements[0];
        let prevTangent = 0;
        const offset = random.gaussian(0, 0.08);

        return [].concat(elements).concat(
          elements
            .map((element, index) => {
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

              const tangent =
                angle(prevElement.center, element.center) + Math.PI / 2;

              const line = Line(
                translateVector(
                  offset * prevElement.radius,
                  prevTangent,
                  prevElement.center
                ),
                translateVector(
                  offset * element.radius,
                  tangent,
                  element.center
                ),
                {
                  color: element.fill.color,
                  opacity: element.fill.opacity,
                  width: element.radius * 0.3 * progress,
                  style: CanvasJpStrokeStyle.round,
                }
              );

              prevElement = element;
              prevTangent = tangent;

              return line;
            })
            .slice(1, -1)
        );
      }
      line.fxname = "Feather";

      const useOnlyBaseRotation = random.value() < 0.2;
      const rotationOffset =
        random.value() * (useOnlyBaseRotation ? Math.PI : Math.PI * 0.22);
      const lengthFactor = useOnlyBaseRotation
        ? 1
        : clamp(0, 5, 1 / Math.cos(rotationOffset));
      function stripe(elements: CanvasJpArc[]): CanvasJpDrawable[] {
        let prevElement = elements[0];
        return [].concat(
          elements
            .map((element, index) => {
              const progress = index / elements.length;
              let elementAngle = angle(prevElement.center, element.center);
              let tangent = 0;
              if (!useOnlyBaseRotation) {
                tangent = elementAngle + Math.PI / 2;
              }
              tangent += random.gaussian(0, 0.05);

              prevElement = element;

              let basePosition = translateVector(
                random.gaussian(0, (width / 300) * progress),
                elementAngle,
                element.center
              );

              const start = rotate(
                basePosition,
                rotationOffset,
                translateVector(
                  element.radius * lengthFactor,
                  tangent,
                  basePosition
                )
              );
              const end = rotate(
                basePosition,
                rotationOffset,
                translateVector(
                  -element.radius * lengthFactor,
                  tangent,
                  basePosition
                )
              );

              return Line(start, end, {
                color: element.fill.color,
                opacity: element.fill.opacity,
                style: CanvasJpStrokeStyle.round,
                width: width / 300,
              });
            })
            .filter(Boolean)
            .slice(1, -1)
        );
      }
      stripe.fxname = "Stripe";

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
      transformBorder.fxname = "Neon";

      const hasNoisyPhase = colorMixer !== randomMix && random.value() > 0.9;
      const minimumEdge = hasNoisyPhase ? 5 : 3;

      const numberOfEdges = clamp(
        minimumEdge,
        Number.MAX_SAFE_INTEGER,
        Math.ceil(random.gaussian(minimumEdge, 2))
      );
      const angleBackward = random.value() > 0.5;
      function tranformShape(elements: CanvasJpArc[]) {
        let previousElement = elements[0];
        const result = elements
          .map((element) => {
            const phase =
              angle(element.center, previousElement.center) +
              (hasNoisyPhase ? random.gaussian(Math.PI, 0.3) : 0);
            previousElement = element;
            return SmoothShape(
              new Array(numberOfEdges).fill(null).map((_, index) => {
                const progress = index / numberOfEdges;
                const pointAngle = progress * Math.PI * 2 + phase;
                return translateVector(
                  element.radius,
                  pointAngle,
                  element.center
                );
              }),
              0.15,
              element.fill
            );
          })
          .slice(1);

        return angleBackward ? result.reverse() : result;
      }
      tranformShape.fxname = "Shape";

      function transformClouds(elements: CanvasJpArc[]) {
        if (random.value() > 0.3) {
          return;
        }
        let streetTag = [];

        let previousElement = elements[0];
        for (let i = 1; i < elements.length; i++) {
          const currentElement = elements[i];
          let angleBetweenElements = angle(
            previousElement.center,
            currentElement.center
          );
          let distanceBetweenElements = distance(
            currentElement.center,
            previousElement.center
          );

          const numberOfCircles = Math.ceil(
            distanceBetweenElements / gradientPrecision
          );
          const distanceBetweenCircles =
            distanceBetweenElements / numberOfCircles;

          streetTag = streetTag.concat(
            new Array(numberOfCircles).fill(null).map((_, index) => {
              const progress = index / numberOfCircles;
              const positionOnMainLine = translateVector(
                progress * distanceBetweenElements,
                angleBetweenElements,
                currentElement.center
              );
              const distanceFromMainLine = Math.pow(
                clamp(-1, 1, random.gaussian(0, 0.35)),
                2.2
              );
              return Circle(
                translateVector(
                  distanceFromMainLine *
                    currentElement.radius *
                    1.5 *
                    (random.value() > 0.1 ? 1 : -0.5),
                  angleBetweenElements + Math.PI / 2,
                  positionOnMainLine
                ),
                currentElement.radius,
                {
                  ...currentElement.fill,
                  opacity: currentElement.fill.opacity,
                }
              );
            })
          );

          //   claws = claws.concat(
          //     new Array(numberOfClaws)
          //       .fill(null)
          //       .map((_, clawIndex) => {
          //         const clawProgress =
          //           clawIndex / (numberOfClaws - 1) + clawOffset[clawIndex];

          //         const distanceProgress = mapRange(clawProgress, 0, 1, -1, 1);

          //         const d =
          //           currentElement.radius *
          //           Math.pow(
          //             distanceProgress *
          //               random.noise1D(
          //                 Math.cos(i / 2 + clawOffset[clawIndex] * 20) + i / 10
          //               ),
          //             2.3
          //           );

          //         const d2 =
          //           currentElement.radius *
          //           Math.pow(
          //             distanceProgress *
          //               random.noise1D(
          //                 Math.cos((i + 0.5) / 2 + clawOffset[clawIndex] * 20) +
          //                   i / 10
          //               ),
          //             2.3
          //           );

          //         return [
          //           Circle(
          //             translateVector(d, tangent, currentElement.center),
          //             currentElement.radius / 5,
          //             {
          //               ...currentElement.fill,
          //               opacity:
          //                 random.gaussian(0.3, 0.2) *
          //                 (1 - d / currentElement.radius),
          //             }
          //           ),
          //           Circle(
          //             translateVector(
          //               distanceBetweenElements * 0.5,
          //               tangent - Math.PI / 2,
          //               translateVector(d2, tangent, currentElement.center)
          //             ),
          //             currentElement.radius / 5,
          //             {
          //               ...currentElement.fill,
          //               opacity:
          //                 random.gaussian(0.3, 0.2) *
          //                 (1 - d2 / currentElement.radius),
          //             }
          //           ),
          //         ];
          //       })
          //       .flat()
          //   );

          previousElement = currentElement;
        }

        return streetTag;
      }
      transformClouds.fxname = "Cloud";

      console.log("===========");
      console.log({
        Seed: random.getSeed(),
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
      let cadre = [
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

      /*
      const debugSize = width / palette.length;
      const debugHeight = debugSize / 2;
      const gradientSize = debugSize / 100;
      const debugPalette = palette
        .map((color, index) => {
          return PolygonFromRect(
            index * debugSize,
            0,
            debugSize,
            debugHeight
          ).toShape({
            color: color,
            opacity: 1,
          });
        })
        .concat(
          palette
            .map((color, index) => {
              return palette
                .filter((item) => item !== color)
                .map((secondColor, secondColorIndex) => {
                  return new Array(100).fill(null).map((_, gradientIndex) => {
                    return PolygonFromRect(
                      (secondColorIndex + 1) * debugSize +
                        gradientIndex * gradientSize,
                      debugHeight * (index + 1),
                      gradientSize,
                      debugHeight
                    ).toShape({
                      color: colorMixer(
                        color,
                        secondColor,
                        1 - gradientIndex / 100
                      ),
                      opacity: 1,
                    });
                  });
                })
                .concat([
                  PolygonFromRect(
                    0,
                    debugHeight * (index + 1),
                    debugSize,
                    debugHeight
                  ).toShape({
                    color,
                    opacity: 1,
                  }),
                ]);
            })
            .flat()
            .flat()
        );
        */

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

      let texture = [];
      const textureLength = width / 200;

      const moveTextureLines = (point) => {
        return translateVector(
          mapRange(
            random.noise2D(point.x / 100, point.y / 100),
            -1,
            1,
            0,
            textureLength / 2
          ),
          mapRange(
            random.noise2D(point.x / 100, point.y / 100),
            -1,
            1,
            0,
            Math.PI * 2
          ),
          point
        );
      };

      const offset = Point(0, random.gaussian(0, textureLength / 2));
      for (let x = 0; x < width / textureLength; x++) {
        for (let y = 0; y < height / textureLength; y++) {
          const startTextureLine = Point(x * textureLength, y * textureLength);
          const endTextureLine = Point(
            x * textureLength + textureLength,
            y * textureLength
          );
          texture.push(
            Line(
              moveTextureLines(startTextureLine),
              translate(offset.x, offset.y, moveTextureLines(endTextureLine)),
              {
                color: Color(
                  0,
                  0,
                  mapRange(
                    random.noise2D(
                      startTextureLine.x / 100,
                      startTextureLine.y
                    ),
                    -1,
                    1,
                    0.2,
                    0.8
                  ) *
                    (y / (height / textureLength))
                ),
                opacity: 0.06,
                width: mapRange(
                  random.noise2D(startTextureLine.x / 100, startTextureLine.y),
                  -1,
                  1,
                  0.3,
                  2.5
                ),
              }
            )
          );
        }
      }

      // @ts-ignore
      window.$fxhashFeatures = {
        Position: placement.fxname,
        Direction: directionFunction.fxname,
        "Color Picker": colorPickerFactory.fxname,
        "Color Mixer": hasNoGradient ? "Flat" : colorMixer.fxname,
        Style: transformElement.fxname,
      };
      console.log(window.$fxhashFeatures);

      yield {
        background: backgroundColor,
        elements: []
          .concat(background)
          //   .concat(texture)
          //   .concat(Overlay(texture))
          .concat(progressBar(0)),
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

      let grid = [];

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

        const lengthOfFade = 10;
        const wiggle = random.gaussian(0, 0.15);
        let continueToAddShapes = true;
        const cutElement = element.filter((shape) => {
          continueToAddShapes = continueToAddShapes && isVisible(shape, wiggle);
          return continueToAddShapes;
        });
        const cutElementWithFade = cutElement.slice(0, -lengthOfFade).concat(
          cutElement.slice(-lengthOfFade).map((shape, index) => {
            const radiusProgress = 1 - index / lengthOfFade;
            const opacityProgress =
              index === lengthOfFade - 1
                ? 0.85
                : index === lengthOfFade - 2
                ? 0.95
                : 1;
            return Circle(
              shape.center,
              shape.radius *
                mapRange(Math.pow(radiusProgress, 0.5), 0, 1, 0.3, 1),
              {
                ...shape.fill,
                opacity: shape.fill.opacity * opacityProgress,
              }
            );
          })
        );

        const cutElementDistance =
          cutElementWithFade.length > 1
            ? distance(
                cutElementWithFade[0].center,
                cutElementWithFade[cutElementWithFade.length - 1].center
              )
            : 0;
        const elementDistance =
          element.length > 1
            ? distance(element[0].center, element[element.length - 1].center)
            : 0;

        if (
          elementDistance > 0 &&
          cutElementDistance > 0 &&
          (cutElementDistance > width / 30 || elementDistance <= width / 30)
        ) {
          const transformedElement = transformElement(cutElementWithFade);
          if (transformedElement) {
            grid.push({
              element: transformedElement,
              position: distanceFromCenter,
            });
          }
        }
      }

      // Draw the outer elements first. This helps creating some sort of depth feeling
      if (
        directionFunction !== directionFlat ||
        placement === placeElementGrid
      ) {
        grid.sort((a, b) => a.position - b.position);
      }

      if (placement === placeElementGrid) {
        const thresholdOfElements = mapRange(
          Math.pow(random.value(), 7),
          0,
          1,
          0.3,
          0.8
        );
        grid = grid.slice(0, grid.length * thresholdOfElements);
      }

      function isVisible(shape: CanvasJpArc, wiggle: number) {
        const margin = waveMargin + shape.radius * (0.6 + wiggle);
        return (
          shape.center.x > margin &&
          shape.center.x < width - margin &&
          shape.center.y > margin &&
          shape.center.y < height - margin
        );
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

      if (animate) {
        const totalNumberOfShapesToDraw = grid
          .map(({ element }) => element.length)
          .reduce((acc, length) => acc + length, 0);

        const getNumberOfElementsPerFrame = () =>
          (totalNumberOfShapesToDraw / getTimeToDraw()) * 16.6;

        let numberOfRenderedElements = 0;
        let elementsToRender = [];

        let lastFrame = Number.MAX_SAFE_INTEGER;
        let start = performance.now();

        for (let { element } of grid) {
          for (let shape of element) {
            elementsToRender.push(shape);
            numberOfRenderedElements++;

            let numberOfElementsPerFrame = getNumberOfElementsPerFrame();
            if (elementsToRender.length > numberOfElementsPerFrame) {
              yield {
                background: null,
                elements: []
                  .concat(elementsToRender)
                  .concat(
                    progressBar(
                      1 - numberOfRenderedElements / totalNumberOfShapesToDraw
                    )
                  ),
              };

              let end = performance.now();
              lastFrame = end - start;
              start = end;

              if (timeAuto && !save) {
                if (lastFrame > 60) {
                  numberOfElementsPerFrame /= 1.2;
                  timeToDraw = timeToDraw * 1.2;
                } else if (lastFrame < 30 && timeToDraw > defaultTimeToDraw) {
                  timeToDraw = timeToDraw / 1.2;
                }
              }

              elementsToRender = [];
            }
          }
        }

        yield {
          background: null,
          elements: elementsToRender.concat(cadre),
        };
      } else {
        yield {
          background: null,
          elements: grid
            .map(({ element }) => element)
            .flat()
            .concat(cadre),
        };
      }
    },
    {
      width: width,
      height: height,
      resolution: resolution,
      interactive: false,
    }
  );
  fxpreview();
}

draw({
  // @ts-ignore
  forceSeed: fxhash,
});

window.addEventListener("click", () => {
  draw();
});

let directoryHandle: FileSystemDirectoryHandle | null = null;
async function saveImage(name) {
  if (!directoryHandle) {
    directoryHandle = await window.showDirectoryPicker();
  }
  const canvas = document.querySelector("canvas");
  const fileHandle = await directoryHandle.getFileHandle(name, {
    create: true,
  });
  const writable = await fileHandle.createWritable();
  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/png");
  });
  await writable.write(blob);
  await writable.close();
}

window.addEventListener("keydown", async (event) => {
  if (["<", "?"].includes(event.key)) {
    alert(
      `Hey! Julien Pradet speaking. Nice to meet you! You can find me at https://twitter.com/JulienPradet".
"?" to display this alert.`
    );
  } else if (event.key === " ") {
    await draw();
  } else if (event.key === "s") {
    await saveImage("test.png");
  } else if (event.key === "g") {
    for (let i = 0; i < 300; i++) {
      await draw({ animate: false });
      await saveImage(`${i}.png`);
    }
  }
});

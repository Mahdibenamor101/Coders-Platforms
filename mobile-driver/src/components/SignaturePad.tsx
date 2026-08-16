import { useMemo, useRef, useState } from "react";
import { PanResponder, StyleSheet, View, Text, Pressable } from "react-native";
import Svg, { Path } from "react-native-svg";
import { colors } from "../theme";

type Point = { x: number; y: number };

export function SignaturePad({ onChange }: { onChange: (svgPath: string) => void }) {
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const currentStroke = useRef<Point[]>([]);
  const [, forceRender] = useState(0);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          currentStroke.current = [{ x: locationX, y: locationY }];
          forceRender((n) => n + 1);
        },
        onPanResponderMove: (event) => {
          const { locationX, locationY } = event.nativeEvent;
          currentStroke.current = [...currentStroke.current, { x: locationX, y: locationY }];
          forceRender((n) => n + 1);
        },
        onPanResponderRelease: () => {
          setStrokes((prev) => {
            const next = [...prev, currentStroke.current];
            currentStroke.current = [];
            onChange(strokesToPath(next));
            return next;
          });
        },
      }),
    [onChange]
  );

  function clear() {
    setStrokes([]);
    currentStroke.current = [];
    onChange("");
  }

  const allStrokes = currentStroke.current.length > 0 ? [...strokes, currentStroke.current] : strokes;

  return (
    <View>
      <View style={styles.pad} {...panResponder.panHandlers}>
        <Svg width="100%" height="100%">
          {allStrokes.map((stroke, i) => (
            <Path
              key={i}
              d={pointsToPathD(stroke)}
              stroke={colors.text}
              strokeWidth={2.5}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </Svg>
        {allStrokes.length === 0 && <Text style={styles.placeholder}>Signez ici</Text>}
      </View>
      <Pressable onPress={clear} style={styles.clearBtn}>
        <Text style={styles.clearText}>Effacer</Text>
      </Pressable>
    </View>
  );
}

function pointsToPathD(points: Point[]) {
  if (points.length === 0) return "";
  return points.reduce(
    (acc, p, i) => acc + (i === 0 ? `M ${p.x} ${p.y}` : ` L ${p.x} ${p.y}`),
    ""
  );
}

function strokesToPath(strokes: Point[][]) {
  return strokes.map(pointsToPathD).join(" ");
}

const styles = StyleSheet.create({
  pad: {
    height: 160,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  placeholder: {
    position: "absolute",
    color: colors.textFaint,
    fontSize: 13,
  },
  clearBtn: {
    marginTop: 6,
    alignSelf: "flex-end",
  },
  clearText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "600",
  },
});

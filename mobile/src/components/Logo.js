import { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors } from '../theme.js';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const CABLE_X = [40, 50, 60];
const CABLE_DELAY_MS = [0, 200, 400];

function usePulse(enabled, delay) {
  const value = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!enabled) return undefined;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(value, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(value, { toValue: 0, duration: 700, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [enabled, delay, value]);

  return value.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });
}

// The AgentBridge mark: a suspension bridge connecting a solid anchor (the
// agent, on your PC) to a hollow one (the phone, waiting to connect).
// From the Figma source:
//   dim      - desaturated, low opacity (empty states)
//   cables   - false hides the suspender cables (small/list-scale usage)
//   animated - pulses the cables in sequence (launch screen, looking for
//              a paired agent)
function Logo({ size = 28, dim = false, cables = true, animated = false }) {
  const p0 = usePulse(animated, CABLE_DELAY_MS[0]);
  const p1 = usePulse(animated, CABLE_DELAY_MS[1]);
  const p2 = usePulse(animated, CABLE_DELAY_MS[2]);
  const pulses = [p0, p1, p2];

  const accent = dim ? colors.textFaint : colors.accent;
  const ring = dim ? colors.textFaint : colors.text;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" fill="none" opacity={dim ? 0.35 : 1}>
      <Circle cx="22" cy="58" r="9" fill={accent} />
      <Circle cx="78" cy="58" r="9" stroke={ring} strokeWidth={5} />
      <Path d="M22 58 C 34 30, 66 30, 78 58" stroke={accent} strokeWidth={5.5} strokeLinecap="round" />
      {cables && (
        animated
          ? CABLE_X.map((x, i) => (
              <AnimatedPath
                key={x}
                d={`M${x} ${x === 50 ? 33 : 38} L${x} 58`}
                stroke={colors.accent}
                strokeWidth={3.5}
                strokeLinecap="round"
                opacity={pulses[i]}
              />
            ))
          : <Path d="M40 38 L40 58 M50 33 L50 58 M60 38 L60 58" stroke={colors.textFaint} strokeWidth={3.5} strokeLinecap="round" />
      )}
    </Svg>
  );
}

export default Logo;

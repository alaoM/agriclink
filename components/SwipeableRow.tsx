import React, { forwardRef, useRef } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import ReanimatedSwipeable, {
    SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

type RenderFn = (...args: any[]) => React.ReactNode;

interface Props {
  children: React.ReactNode;
  renderLeftActions?: RenderFn;
  renderRightActions?: RenderFn;
  onSwipeOpen?: (dir: 'left' | 'right') => void;
  threshold?: number;
  friction?: number;
  containerStyle?: StyleProp<ViewStyle>;
}

function InnerSwipeableRow(
  {
    children,
    renderLeftActions = () => null,
    renderRightActions = () => null,
    onSwipeOpen,
    threshold = 40,
    friction = 2,
    containerStyle,
  }: Props,
  _ref // not needed outside
) {
  const swipeRef = useRef<SwipeableMethods>(null);

  return (
    <ReanimatedSwipeable
      ref={swipeRef}
      friction={friction}
      leftThreshold={threshold}
      rightThreshold={threshold}
      renderLeftActions={renderLeftActions}
      renderRightActions={renderRightActions}
      overshootLeft={false}
      overshootRight={false}
      onSwipeableOpen={(dir) => {
        onSwipeOpen?.(dir);
        // <<< automatically close after action >>>
        swipeRef.current?.close();
      }}
      enableTrackpadTwoFingerGesture
      containerStyle={containerStyle}
    >
      {children}
    </ReanimatedSwipeable>
  );
}

export default forwardRef(InnerSwipeableRow);

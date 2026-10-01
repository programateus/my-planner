import { useMemo } from 'react';
import { useSharedValue, useAnimatedScrollHandler, useDerivedValue, useAnimatedStyle, } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { useKeyboardHandler } from 'react-native-keyboard-controller';
export const useKeyboardAwareChat = () => {
    const keyboardHeight = useSharedValue(0);
    const keyboardProgress = useSharedValue(0);
    const scrollY = useSharedValue(0);
    useKeyboardHandler({
        onInteractive: (e) => {
            'worklet';
            keyboardHeight.set(e.height);
            keyboardProgress.set(e.progress);
        },
    });
    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (e) => {
            scrollY.set(e.contentOffset.y);
        },
    });
    const keyboardOffset = useDerivedValue(() => {
        return keyboardHeight.value * keyboardProgress.value;
    });
    const inputStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: -keyboardOffset.value,
                },
            ],
        };
    }, [keyboardHeight.value, keyboardProgress.value]);
    const listContentStyle = useAnimatedStyle(() => {
        return {
            paddingBottom: keyboardOffset.value,
        };
    }, [keyboardOffset.value]);
    const panGesture = useMemo(() => {
        return Gesture.Pan();
    }, []);
    return {
        scrollHandler,
        inputStyle,
        listContentStyle,
        panGesture,
    };
};

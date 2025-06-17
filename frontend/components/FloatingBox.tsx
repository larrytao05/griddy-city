import { View, StyleSheet, LayoutChangeEvent, useWindowDimensions, Animated } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';
import { useState, useEffect, useRef } from 'react';

interface FloatingBoxProps {
    children: React.ReactNode;
    anchorPosition: {
        x: number;
        y: number;
    };
    placement?: 'top' | 'bottom';
}

export function FloatingBox({ children, anchorPosition, placement = 'bottom' }: FloatingBoxProps) {
    const { colors } = useThemeContext();
    const { height: windowHeight, width: windowWidth } = useWindowDimensions();
    const [boxHeight, setBoxHeight] = useState(0);
    const [boxWidth, setBoxWidth] = useState(0);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const onLayout = (event: LayoutChangeEvent) => {
        const { height, width } = event.nativeEvent.layout;
        setBoxHeight(height);
        setBoxWidth(width);
    };

    const getPosition = () => {
        const spaceBelow = windowHeight - anchorPosition.y;
        const spaceAbove = anchorPosition.y;
        
        // Calculate vertical position
        const verticalPosition = placement === 'top' || 
            (placement === 'bottom' && spaceBelow < boxHeight && spaceAbove > spaceBelow)
            ? { bottom: windowHeight - anchorPosition.y + 12 }
            : { top: anchorPosition.y + 12 };

        // Calculate horizontal position
        let horizontalPosition;
        
        // If we don't know the box width yet, just center it on the anchor
        if (boxWidth === 0) {
            horizontalPosition = { left: anchorPosition.x };
        } else {
            // First, try to center the box on the anchor point
            let leftPosition = anchorPosition.x - boxWidth / 2;
            
            // Check if this would cause overflow
            if (leftPosition < 0) {
                // Box would overflow left edge, align to left
                horizontalPosition = { left: 20 };
            } else if (leftPosition + boxWidth > windowWidth) {
                // Box would overflow right edge, align to right
                horizontalPosition = { right: 20 };
            } else {
                // Box fits, use centered position
                horizontalPosition = { left: leftPosition };
            }
        }

        const finalPosition = {
            ...verticalPosition,
            ...horizontalPosition,
        };
        
        return finalPosition;
    };

    return (
        <Animated.View 
            style={[
                styles.container, 
                { backgroundColor: colors.neutralMid },
                getPosition(),
                { opacity: fadeAnim }
            ]}
            onLayout={onLayout}
        >
            {children}
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        borderRadius: 8,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        zIndex: 1000
    }
}); 
import { View, Text, StyleSheet } from 'react-native';
import { useThemeContext } from '@/context/ThemeContext';

export default function Profile() {
  const { colors } = useThemeContext();

  return (
    <View style={[styles.container, { backgroundColor: colors.neutral }]}>
      <Text style={[styles.text, { color: colors.neutralOpposite }]}>Profile Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 20,
  },
}); 
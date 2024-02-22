import React from 'react';
import { View, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'blue',
  },
});

const MyView = () => {
  return (
    <View style={styles.container}>
      {/* Add your components here */}
    </View>
  );
};

export default MyView;

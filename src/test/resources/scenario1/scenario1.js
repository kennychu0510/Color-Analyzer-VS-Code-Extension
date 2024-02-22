import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const file1 = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>file1</Text>
    </View>
  )
}

export default file1

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  text: {
    color: '#343434',
    fontWeight: 'bold'
  }
})
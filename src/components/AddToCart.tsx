import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';

const AddToCart = ({ bgColor, textColor, onPress }: any) => {
  const [counter, setCounter] = useState(0);

  const togglerStyles: any = counter > 0 ? { color: textColor } : { color: bgColor };
  const counterStyles: any = counter > 0 ? { color: textColor, fontWeight: 'bold' } : { color: bgColor };

  const _onPress = (_counter: number) => {
    setCounter(_counter);
    onPress(_counter);
  }

  return (
    <View
      style={[
        styles.container,
        { borderColor: bgColor },
        (counter > 0 ? { backgroundColor: bgColor } : null)
      ]}
    >
      <TouchableWithoutFeedback onPress={() => _onPress(counter > 0 ? counter - 1 : 0)} testID='delete'>
        <View style={styles.toggler}>
          <Text style={[styles.togglerText, togglerStyles]}>-</Text>
        </View>
      </TouchableWithoutFeedback>

      <View style={styles.counter}>
        <Text style={[styles.counterText, counterStyles]} testID='counter'>
          { counter }
        </Text>
      </View>

      <TouchableWithoutFeedback onPress={() => _onPress(counter + 1)} testID='add'>
        <View style={styles.toggler}>
          <Text style={[styles.togglerText, togglerStyles]}>+</Text>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
};

AddToCart.defaultProps = {
  bgColor: '#999999',
  textColor: '#ffffff',
  onPress: () => {},
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    height: 30,
    width: '83%',
    borderRadius: 10,
    marginTop: 2,
    marginBottom: 10,
    borderWidth: 2,
  },
  toggler: {
    width: 30,
    height: 30,
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: -4,
  },
  togglerText: {
    fontSize: 28,
    textAlign: 'center',
  },
  counter: {
    width: 30,
    height: 30,
    alignSelf: 'center',
    justifyContent: 'center',
    marginTop: -1.5,
  },
  counterText: {
    fontSize: 19,
    textAlign: 'center',
  }
});

export default AddToCart;

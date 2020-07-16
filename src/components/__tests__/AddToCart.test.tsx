import React from 'react';
import { render, fireEvent } from 'react-native-testing-library';
import AddToCart from '../AddToCart';

describe('AddToCart', () => {
  test('should have default onPress function', () => {
    const onPress = AddToCart.defaultProps.onPress;

    expect(onPress).toBeDefined();
    expect(onPress()).toBe(undefined);
  });

  test('should add and remove from cart', () => {
    const onPressHandler = jest.fn();

    const { getByTestId } = render(
      <AddToCart onPress={onPressHandler} />
    );

    const addBtn = getByTestId('add');
    const delBtn = getByTestId('delete');

    fireEvent.press(delBtn); // 0
    fireEvent.press(addBtn); // 1
    fireEvent.press(addBtn); // 2
    fireEvent.press(delBtn); // 0

    expect(onPressHandler).toHaveBeenCalledWith(1);
    expect(onPressHandler).toHaveBeenCalledWith(2);
    expect(onPressHandler).toHaveBeenCalledWith(1);

    const counter = getByTestId('counter').children.toString();
    expect(counter).toBe("1");
  });
});

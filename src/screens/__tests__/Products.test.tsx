import React from 'react';
import { render, fireEvent, waitFor } from 'react-native-testing-library';
import AsyncStorage from '@react-native-community/async-storage';
import Products from '../Products';

const mockNavigation = {
  navigate: jest.fn(),
  setOptions: jest.fn(),
};

const PocId = '532';

describe('Products', () => {
  test('should render all products, then select a category', async (done) => {
    AsyncStorage.setItem('poc', JSON.stringify({ id: PocId }))
    .then(async () => {
      const onLoadProducts = jest.fn();

      const { getByTestId } = render(
        <Products
          lazyLoader={false}
          onLoadProducts={onLoadProducts}
          navigation={mockNavigation}
        />
      );

      // Did the product list render?
      await waitFor(() => expect(getByTestId('productList')).toBeDefined());

      // Did the category list render?
      await waitFor(() => expect(getByTestId('categoryList')).toBeDefined());

      // Select the first category
      const firstCategory = await getByTestId('cat_1');
      fireEvent.press(firstCategory);

      // Did the list render two times (one for default category + one for selected category)?
      await waitFor(() => expect(onLoadProducts).toBeCalledTimes(2));

      done();
    })
    .catch((e) => {
      console.log(e)
    });
  }, 20000);
});

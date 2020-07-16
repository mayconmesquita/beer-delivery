import React from 'react';
import 'react-native';
import { render, fireEvent, waitFor } from 'react-native-testing-library';
import Home from '../Home';
import '../../../__mocks__/xhr-mock';
import 'axios-mock-adapter';

const demoAddress = {
  address: "Rua Américo Brasiliense",
  fullAddress: "R. Américo Brasiliense - Chácara Santo Antônio (Zona Sul), São Paulo - SP, Brasil",
  lat: -23.6317641,
  lng: -46.7014641,
}

const PocId = '532';

describe('Home', () => {
  test('should show places when change input text, then press cancel', async () => {
    const { getByTestId } = render(
      <Home />
    );

    const textInput = getByTestId('addressInput');
    const newValue = 'Rua Américo Brasiliense';
    fireEvent.changeText(textInput, newValue);

    const cancelBtn = getByTestId('cancelButton');
    await waitFor(() => expect(cancelBtn).toBeDefined());

    fireEvent.press(cancelBtn);
  });

  test('should return a valid Poc ID, getting data from props', async () => {
    const onGetPocId = jest.fn();

    const { getByTestId } = render(
      <Home
        onGetPocId={onGetPocId}
        addressData={demoAddress}
      />
    );

    const submitBtn = getByTestId('submitButton');

    fireEvent.press(submitBtn);

    await waitFor(() => expect(onGetPocId).toBeCalledWith(PocId));
  });

  test('should show invalidAddress error', async () => {
    const onShowError = jest.fn();

    const { getByTestId } = render(
      <Home
        onShowError={onShowError}
        addressData={{ ...demoAddress, address: '' }}
      />
    );

    const submitBtn = getByTestId('submitButton');

    fireEvent.press(submitBtn);

    await waitFor(() => expect(onShowError).toBeCalledWith('invalidAddress'));
  });

  test('should show availability error', async () => {
    const onShowError = jest.fn();

    const { getByTestId } = render(
      <Home
        onShowError={onShowError}
        addressData={{ ...demoAddress, lat: 40.730610, lng: -73.935242 }}
      />
    );

    const submitBtn = getByTestId('submitButton');

    fireEvent.press(submitBtn);

    await waitFor(() => expect(onShowError).toBeCalledWith('availability'));
  });

  test('should show unknown error', async () => {
    const onShowError = jest.fn();

    const { getByTestId } = render(
      <Home
        onShowError={onShowError}
        addressData={{ ...demoAddress, lat: 0 }}
      />
    );

    const submitBtn = getByTestId('submitButton');

    fireEvent.press(submitBtn);

    await waitFor(() => expect(onShowError).toBeCalledWith('unknown'));
  });
});

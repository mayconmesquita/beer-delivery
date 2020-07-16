import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, ActivityIndicator, Alert, Dimensions, ScrollView, InteractionManager } from 'react-native';
import LottieView from 'lottie-react-native';
import FloatingLabelInput from '../components/FloatingLabelInput';
import Touchable from 'react-native-touchable-safe';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { getAsyncStorageData, setAsyncStorageData } from '../helpers/AsyncStorage';
import { Api } from '../services/Api';
import { ApiQuery } from '../services/ApiQuery';

const DeliveryAnimation = require('../assets/lottie/delivery.json');
const deviceHeight = Dimensions.get('window').height;

interface AddressObject {
  address?: string;
  fullAddress?: string;
  lat?: string;
  lng?: string;
}

const Home = (props: any) => {
  const { navigation, addressData, onGetPocId, onShowError } = props;

  const autocompleteRef: any = useRef(null);

  const [addressValue, setAddressValue] = useState(addressData?.address);
  const [addressObject, setAddressObject] = useState<AddressObject>(addressData);
  const [showPlaces, setShowPlaces] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getStorageAddress();
    showDemoAlert();
  }, []);

  const getStorageAddress = () => {
    getAsyncStorageData('address').then(async (data) => {
      if (data?.address) {
        setAddressValue(data.address);
        setAddressObject(data);
      }
    });
  }

  const showDemoAlert = () => {
    Alert.alert(
      'Ambiente de testes',
      'Este app é apenas uma demonstração.',
    );
  }

  const onChangeAddress = (inputRef: any, text: string) => {
    setShowPlaces(true);
    setAddressValue(text);
    setAddressObject({});

    /* istanbul ignore else */
    if (autocompleteRef && autocompleteRef.current) {
      autocompleteRef.current.setAddressText(text);

      /* istanbul ignore else */
      if (autocompleteRef.current._request) {
        autocompleteRef.current._request(text);
      }
    }
  }

  /* istanbul ignore next */
  const selectAddress = (data: any, details: any = null) => {
    InteractionManager.runAfterInteractions(() => {
      setShowPlaces(false);
      setAddressValue(details.name);

      setAddressObject({
        address: details.name,
        fullAddress: details.formatted_address,
        lat: details.geometry.location.lat,
        lng: details.geometry.location.lng,
      });
    });
  }

  const cancelSaving = () => {
    setShowPlaces(false);
  }

  const saveAddress = async () => {
    if (!addressValue || !addressObject?.address) {
      return showError('invalidAddress');
    } else if (!addressObject.lat || !addressObject.lng) {
      return showError('unknown');
    }

    setLoading(true);

    setAsyncStorageData('address', addressObject).then(() => {
      Api.graphql.post('', {
        operationName: ApiQuery.pocSearchMethod.operationName,
        query: ApiQuery.pocSearchMethod.query,
        variables: {
          algorithm: 'NEAREST',
          lat: addressObject.lat,
          long: addressObject.lng,
          now: new Date().toISOString(),
        }
      })
      .then((res: any) => {
        const { data } = res.data;

        const PocId = data?.pocSearch?.[0]?.id;

        if (!PocId) return showError('availability');

        /* istanbul ignore if */
        if (data?.errors?.length > 0) return showError('unknown');

        onGetPocId(PocId);

        setAsyncStorageData('poc', { id: PocId }).then(() => {
          goToHome();
        });
      })
      .catch(
        /* istanbul ignore next */
        (err: any) => {
        showError('unknown');
      });
    });
  }

  const goToHome = () => {
    setLoading(false);

    navigation.navigate('Products');
  }

  const showError = (type: string) => {
    /* istanbul ignore else */
    if (type === 'invalidAddress') {
      Alert.alert(
        'Endereço inválido',
        'Para prosseguir, preencha um endereço válido.',
      );
    }

    /* istanbul ignore else */
    if (type === 'availability') {
      Alert.alert(
        'Algo deu errado',
        'Nós não estamos disponível em seu endereço, ainda.',
      );
    }

    /* istanbul ignore else */
    if (type === 'unknown') {
      Alert.alert(
        'Algo deu errado',
        'Nós não conseguimos salvar seu endereço. Tente novamente.',
      );
    }

    onShowError(type);
    setLoading(false);
  }

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps={'always'}>
      <View style={[styles.main]}>
        <LottieView
          source={DeliveryAnimation}
          style={[styles.deliveryAnimation, showPlaces ? { height: 1 } : { marginTop: -60 }]}
          autoPlay
          loop
          speed={loading ? 2.5 : 1}
        />

        <View style={[styles.addressArea, showPlaces ? { marginTop: 55 } : null]}>
          <View style={styles.addressForm}>
            <FloatingLabelInput
              label='Endereço'
              textContentType='streetAddressLine1'
              blurOnSubmit={false}
              noValidation={true}
              onChangeText={onChangeAddress}
              defaultValue=''
              value={addressValue}
              alwaysEnabled={true}
              primaryColor='#009e9e'
              placeholderTextColor='#37413e'
              borderBottomColor='#37413e'
              testID="addressInput"
            />
          </View>

          <GooglePlacesAutocomplete
            ref={autocompleteRef}
            placeholder='Search'
            minLength={2}
            autoFocus={false}
            returnKeyType={'search'}
            listViewDisplayed={showPlaces}
            fetchDetails={true}
            onPress={selectAddress}
            getDefaultValue={() => ''}
            textInputProps={{}}
            GooglePlacesDetailsQuery={{ fields: 'name,formatted_address,geometry' }}
            query={{
              key: 'AIzaSyD6rraZSE7IRXZDKbsiu5hM4HImq4c5ouk',
              language: 'pt',
              location: '-23.6326866, -46.7020266',
              radius: 20000, // 20 km
            }}
            styles={{
              container: showPlaces ? styles.placesContainer : styles.hide,
              textInputContainer: styles.hide,
              listView: styles.autoCompleteListView,
              row: styles.autoCompleteRow,
            }}
            // @ts-ignore
            isRowScrollable={true}
            disableScroll={false}
            enablePoweredByContainer={false}
          />

          { !showPlaces ?
              <Touchable onPress={saveAddress} testID='submitButton'>
                <View style={styles.submitAddressBtn}>
                  <Text style={styles.submitAddressBtnText}>Salvar Endereço</Text>
                </View>
              </Touchable>
            :
              <Touchable onPress={cancelSaving} testID='cancelButton'>
                <View style={[styles.submitAddressBtn, styles.submitAddressBtnClose]}>
                  <Text style={styles.submitAddressBtnText}>Cancelar</Text>
                </View>
              </Touchable>
          }
        </View>

        { loading &&
          <View style={[styles.loadingContainer, { height: deviceHeight }]}>
            <ActivityIndicator size={70} animating={true} color='#009e9e' />
          </View>
        }
      </View>
    </ScrollView>
  );
}

Home.defaultProps = {
  onGetPocId: () => {},
  onShowError: () => {},
  addressData: {
    address: '',
    fullAddress: '',
    lat: '',
    lng: '',
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'column',
  },
  main: {
    flex: 1,
    backgroundColor: '#fff',
  },
  hide: {
    width: 0,
    height: 0,
    flex: 0,
  },
  deliveryAnimation: {
    flex: 1,
    width: '100%'
  },
  autoCompleteListView: {
    flex: 1,
    minHeight: 200,
    marginVertical: 5
  },
  autoCompleteRow: {
    height: 54,
    paddingTop: 20
  },
  loadingContainer: {
    flex: 1,
    position: 'absolute',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#ffffff80',
    width: '100%'
  },
  addressArea: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  addressForm: {
    backgroundColor: '#ecf7f8',
    paddingHorizontal: 10,
    paddingVertical: 20,
    paddingTop: 15,
    borderRadius: 10,
    borderColor: '#009e9e30',
    borderWidth: 1,
  },
  submitAddressBtn: {
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    height: 56,
    width: '100%',
    backgroundColor: '#009e9e',
  },
  submitAddressBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  submitAddressBtnClose: {
    backgroundColor: '#aaa',
  },
  placesContainer: {
    backgroundColor: '#fff',
    width: '100%',
  },
});

export default Home;

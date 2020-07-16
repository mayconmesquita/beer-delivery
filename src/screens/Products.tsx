import React, { useState, useEffect, useLayoutEffect } from 'react';
import { StyleSheet, View, Text, Dimensions, TouchableWithoutFeedback, Image, Alert, FlatList, ActivityIndicator } from 'react-native';
import { Api } from '../services/Api';
import { ApiQuery } from '../services/ApiQuery';
import { getAsyncStorageData } from '../helpers/AsyncStorage';
import AddToCart from '../components/AddToCart';
import Touchable from 'react-native-touchable-safe';
import LottieView from 'lottie-react-native';
// @ts-ignore
import ImageLoad from 'react-native-image-placeholder';

const ArrowLeft = require('../assets/img/arrow-left.png');
const PicturePlaceholder = require('../assets/img/picture-placeholder.png');
const BikerAnimation = require('../assets/lottie/biker.json');
const EmptyBox = require('../assets/lottie/empty-box.json');

const deviceHeight = Dimensions.get('window').height;

const createRows = (data: any, columns: any) => {
  const rows = Math.floor(data.length / columns);
  let lastRowElements = data.length - rows * columns;

  while (lastRowElements !== columns) {
    data.push({
      id: `empty-${lastRowElements}`,
      name: `empty-${lastRowElements}`,
      empty: true
    });

    lastRowElements += 1;
  }

  return data;
}

const Products = (props: any) => {
  const { navigation, lazyLoader, onLoadProducts } = props;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('0');
  const [loading, setLoading] = useState(false);
  const [loadingLite, setLoadingLite] = useState(false);

  useLayoutEffect(() => {
    /* istanbul ignore next */
    if (navigation) {
      navigation.setOptions({
        headerLeft: () => (
          <TouchableWithoutFeedback onPress={() => navigation.goBack()}>
            <View style={styles.backBtnContainer}>
              <Image source={ArrowLeft} style={styles.backBtnImage} />
            </View>
          </TouchableWithoutFeedback>
        ),
      });
    }
  }, [navigation]);

  useEffect(() => {
    (async function init () {
      await getCategories();
      await getProducts();
    })();
  }, []);

  const getCategories = () => {
    setLoading(true);

    Api.graphql.post('', {
      query: ApiQuery.allCategoriesSearch.query,
    })
    .then(async (res: any) => {
      const { data } = res.data;

      const _categories: any = [{ 'title': 'Todos', 'id': '0' }].concat(data.allCategory);

      await setCategories(_categories);
    })
    .catch(
      /* istanbul ignore next */
      async (err: any) => {
      await showError();
    });
  }

  const getProducts = (categoryId?: string) => {
    if (categoryId) setLoadingLite(true);
    else setLoading(true);

    getAsyncStorageData('poc').then((poc) => {
      Api.graphql.post('', {
        query: ApiQuery.poc.query,
        variables: {
          id: poc.id,
          search: '',
          categoryId: categoryId && categoryId !== '0' ? categoryId : null
        }
      })
      .then(async (res: any) => {
        const { data } = res.data;

        if (categoryId) {
          setTimeout(() => setLoadingLite(false), 0);
        } else {
          setTimeout(() => setLoading(false), lazyLoader ? 600 : 0);
        }

        const _products = data?.poc?.products;

        await setProducts(_products);
        await onLoadProducts(_products);
      })
      .catch(
        /* istanbul ignore next */
        async (err: any) => {
        /* istanbul ignore next */
        await showError();
      });
    });
  }

  /* istanbul ignore next */
  const showError = () => {
    Alert.alert(
      'Algo deu errado',
      'Nós não conseguimos listar os produtos. Tente novamente.',
    );

    setLoading(false);
  }

  const formatPrice = (price: number) => {
    let num: any = price.toFixed(2).split('.');
    num[0] = 'R$ ' + num[0].split(/(?=(?:...)*$)/).join('.');
    return num.join(',').replace('.,', ',');
  }

  const columns = 2;

  const selectCategory = (categoryId: string) => {
    getProducts(categoryId);
    setActiveCategory(categoryId);
  }

  return (
    <View style={styles.container}>
      { categories?.length > 0 &&
        <FlatList
          data={categories}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item: any) => 'cat_' + item.id}
          testID='categoryList'
          renderItem={({ item, index }: any) => {
            /* istanbul ignore if */
            if (!item.title) return null;

            return (
              <Touchable onPress={() => selectCategory(item.id)} testID={'cat_' + index}>
                <View style={[styles.categoryBtn, activeCategory === item.id ? styles.categoryBtnActive : null]}>
                  <Text style={[styles.categoryBtnText, activeCategory === item.id ? styles.categoryBtnTextActive : null]}>{ item.title }</Text>
                </View>
              </Touchable>
            );
          }}
        />
      }

      { products?.length > 0
        ?
          <FlatList
            showsVerticalScrollIndicator={false}
            updateCellsBatchingPeriod={20}
            initialNumToRender={25}
            data={createRows(products, columns)}
            keyExtractor={(item: any, index: number) => 'sku_' + (item.id + '_' + index)}
            numColumns={columns}
            contentContainerStyle={{ paddingBottom: 30, minHeight: deviceHeight }}
            testID='productList'
            renderItem={({ item }: any) => {
              /* istanbul ignore if */
              if (item.empty) {
                return <View style={styles.itemEmpty} />;
              }

              /* istanbul ignore if */
              if (!item.title) return null;
              
              return (
                <View style={styles.item}>
                  { item?.images?.[0].url &&
                    <ImageLoad
                      style={{ width: 90, height: 90, backgroundColor: '#fff' }}
                      loadingStyle={{ size: 'large', color: '#009e9e' }}
                      source={{ uri: item.images[0].url }}
                      placeholderSource={PicturePlaceholder}
                      customImagePlaceholderDefaultStyle={{ width: 90, height: 90, backgroundColor: '#fff' }}
                    />
                  }
                  
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemTitle}>{ item.title }</Text>
                    <Text style={styles.itemPrice}>{ formatPrice(item?.productVariants?.[0].price) }</Text>
                  </View>

                  <AddToCart bgColor='#009e9e' textColor='#fff' />
                </View>
              );
            }}
          />
        :
          <View style={[styles.emptyList, { height: deviceHeight }]}>
            <LottieView
              source={EmptyBox}
              resizeMode='cover'
              style={styles.emptyListAnimation}
              autoPlay
              loop={false}
              speed={.6}
            />

            <Text style={styles.emptyListText}>Seção vazia</Text>
            <Text style={styles.emptyListSubText}>Que tal conferir mais tarde?</Text>
          </View>
      }

      { loadingLite &&
        <View style={[styles.loadingLiteContainer, { height: deviceHeight + 200 }]}>
          <ActivityIndicator size={70} animating={true} color='#009e9e' />
        </View>
      }

      { loading &&
        <View style={[styles.loadingContainer, { height: deviceHeight + 200 }]}>
          <LottieView
            source={BikerAnimation}
            style={{ marginTop: -140 }}
            autoPlay
            loop
            speed={.7}
          />

          <Text style={styles.loadingCaption}>Carregando produtos...</Text>
        </View>
      }
    </View>
  );
}

Products.defaultProps = {
  onLoadProducts: () => {},
  lazyLoader: false, // This should be 'false' when testing
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    paddingTop: 70,
    paddingHorizontal: 10,
  },
  emptyList: {
    flex: 1,
    position: 'absolute',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '100%',
  },
  emptyListAnimation: {
    marginTop: -30,
    marginBottom: -10,
    justifyContent: 'center',
    alignSelf: 'center',
    width: 200
  },
  emptyListText: {
    fontSize: 24,
    color: '#333',
    textAlign: 'center',
  },
  emptyListSubText: {
    fontSize: 19,
    color: '#777',
    textAlign: 'center',
    marginTop: 3,
  },
  backBtnContainer: {
    flex: 1,
    marginTop: 24,
    marginLeft: 20
  },
  backBtnImage: {
    width: 30,
    height: 30,
  },
  loadingContainer: {
    flex: 1,
    position: 'absolute',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#ffffff',
    width: '100%',
  },
  loadingLiteContainer: {
    flex: 1,
    position: 'absolute',
    justifyContent: 'center',
    alignSelf: 'center',
    backgroundColor: '#ffffff70',
    width: '100%',
  },
  loadingCaption: {
    fontSize: 25,
    justifyContent: 'center',
    textAlign: 'center',
    marginTop: 60,
  },
  item: {
    alignItems: 'center',
    backgroundColor: '#fff',
    flexBasis: 0,
    flexGrow: 1,
    margin: 8,
    marginBottom: 11,
    borderWidth: 1,
    borderRadius: 15,
    borderColor: '#ddd',
    padding: 5,
    paddingTop: 15,
  },
  itemEmpty: {
    alignItems: 'center',
    flexBasis: 0,
    flexGrow: 1,
    margin: 8,
  },
  itemInfo: {
    padding: 10,
    marginTop: 5,
  },
  itemTitle: {
    color: '#333333',
    textAlign: 'center',
    backgroundColor: '#fff',
    minHeight: 35,
  },
  itemPrice: {
    color: '#333333',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 15,
    fontWeight: 'bold',
  },
  categoryBtn: {
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 15,
    marginHorizontal: 7,
    marginTop: 5,
    marginBottom: 20,
    minWidth: 100,
    height: 45,
    backgroundColor: '#fff',
    borderColor: '#009e9e',
    borderWidth: 2,
  },
  categoryBtnText: {
    color: '#009e9e',
    fontSize: 13,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  categoryBtnActive: {
    backgroundColor: '#009e9e',
    borderWidth: 2,
    borderColor: '#009e9e',
  },
  categoryBtnTextActive: {
    color: '#fff',
  },
});

export default Products;

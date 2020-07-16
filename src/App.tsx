import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, Platform } from 'react-native';
import Home from './screens/Home';
import Products from './screens/Products';

const Stack = createStackNavigator();

StatusBar.setBarStyle('light-content');

/* istanbul ignore if */
if (Platform.OS === 'android') {
  StatusBar.setBackgroundColor('#0a86c9');
}

const forFade = ({ current, closing }: any) => ({
  cardStyle: {
    opacity: current.progress,
  },
});

function App() {
  const headerStyles = {
    headerTransparent: true,
    headerStyle: {
      backgroundColor: 'transparent',
      borderBottomWidth: 0,
    },
    headerTintColor: '#000',
    headerTitleStyle: {
      fontSize: 27,
      fontWeight: 'bold',
      marginTop: 20,
      marginLeft: 5,
    },
    headerBackTitle: '',
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ title: 'Preencha seu endereço', ...headerStyles, cardStyleInterpolator: forFade }}
        />

        <Stack.Screen
          name="Products"
          component={Products}
          options={{ title: 'Produtos', ...headerStyles, cardStyleInterpolator: forFade }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;

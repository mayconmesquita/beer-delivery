import { AppRegistry, LogBox } from 'react-native';
import App from './src/App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

// This is a workaround for GooglePlacesAutocomplete
LogBox.ignoreLogs(['VirtualizedLists should']);

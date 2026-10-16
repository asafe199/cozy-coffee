try {
  require('react-native-reanimated/mock');
} catch (e) {
  // Ignore reanimated mock errors in non-native tests
}
import 'react-native-gesture-handler/jestSetup';

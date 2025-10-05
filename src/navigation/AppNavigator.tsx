import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ExportScreen from '../screens/ExportScreen';
import PhotoPickerScreen from '../screens/PhotoPickerScreen';
import PreviewScreen from '../screens/PreviewScreen';

export type RootStackParamList = {
  Picker: undefined;
  Preview: undefined;
  Export: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Picker">
        <Stack.Screen
          name="Picker"
          component={PhotoPickerScreen}
          options={{ title: 'Select Photos' }}
        />
        <Stack.Screen
          name="Preview"
          component={PreviewScreen}
          options={{ title: 'Preview' }}
        />
        <Stack.Screen
          name="Export"
          component={ExportScreen}
          options={{ title: 'Export' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;

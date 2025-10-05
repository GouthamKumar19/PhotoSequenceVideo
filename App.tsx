import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { SelectionProvider } from './src/context/SelectionContext';

const App: React.FC = () => {
  return (
    <SelectionProvider>
      <AppNavigator />
    </SelectionProvider>
  );
};

export default App;

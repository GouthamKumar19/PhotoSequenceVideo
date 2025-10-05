import React, { createContext, useContext, useMemo, useState } from 'react';

export type SelectedPhoto = {
  id: string;
  uri: string;
  width?: number;
  height?: number;
  filename?: string;
};

type SelectionContextValue = {
  selectedPhotos: SelectedPhoto[];
  setSelectedPhotos: React.Dispatch<React.SetStateAction<SelectedPhoto[]>>;
  resetSelection: () => void;
};

const SelectionContext = createContext<SelectionContextValue | undefined>(undefined);

export const SelectionProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);

  const value = useMemo(
    () => ({
      selectedPhotos,
      setSelectedPhotos,
      resetSelection: () => setSelectedPhotos([]),
    }),
    [selectedPhotos]
  );

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
};

export const useSelection = () => {
  const context = useContext(SelectionContext);

  if (!context) {
    throw new Error('useSelection must be used within a SelectionProvider');
  }

  return context;
};

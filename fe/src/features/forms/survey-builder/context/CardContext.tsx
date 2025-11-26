import React, { createContext, useContext } from 'react';
import type { ReactNode } from 'react';

export interface CardSelectionState {
  selectedId: string | null;
  isDragging: boolean;
  draggedId: string | null;
}

export interface CardSelectionActions {
  selectCard: (id: string) => void;
  clearSelection: () => void;
  setDragging: (isDragging: boolean, draggedId?: string) => void;
}

interface CardSelectionContextType {
  state: CardSelectionState;
  actions: CardSelectionActions;
}

export const CardSelectionContext = createContext<CardSelectionContextType | undefined>(undefined);

export interface CardSelectionProviderProps {
  children: ReactNode;
}

export const CardSelectionProvider: React.FC<CardSelectionProviderProps> = ({ children }) => {
  const [state, setState] = React.useState<CardSelectionState>({
    selectedId: null,
    isDragging: false,
    draggedId: null,
  });

  const actions: CardSelectionActions = React.useMemo(() => ({
    selectCard: (id: string) => {
      setState(prev => ({
        ...prev,
        selectedId: id,
      }));
    },
    clearSelection: () => {
      setState({
        selectedId: null,
        isDragging: false,
        draggedId: null,
      });
    },
    setDragging: (isDragging: boolean, draggedId?: string) => {
      setState(prev => ({
        ...prev,
        isDragging,
        draggedId: draggedId || null,
      }));
    },
  }), []);

  const contextValue = React.useMemo(() => ({
    state,
    actions,
  }), [state, actions]);

  return (
    <CardSelectionContext.Provider value={contextValue}>
      {children}
    </CardSelectionContext.Provider>
  );
};

export const useCardSelection = (): CardSelectionContextType => {
  const context = useContext(CardSelectionContext);
  if (context === undefined) {
    throw new Error('useCardSelection must be used within a CardSelectionProvider');
  }
  return context;
};

// Helper hooks for commonly used state
export const useCardIsSelected = (id: string): boolean => {
  const { state } = useCardSelection();
  return state.selectedId === id;
};

export const useCardIsDragging = (id: string): boolean => {
  const { state } = useCardSelection();
  return state.draggedId === id;
};

export const useAnyCardDragging = (): boolean => {
  const { state } = useCardSelection();
  return state.isDragging;
};
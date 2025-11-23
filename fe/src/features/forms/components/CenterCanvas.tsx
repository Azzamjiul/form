import React, { useState, useCallback } from 'react';
import { SurveyHeaderCard } from './SurveyHeaderCard';
import { TitleDescriptionCard } from './TitleDescriptionCard';
import { QuestionCard } from './QuestionCard';
import { PageBreakCard } from './PageBreakCard';
import { AddElementSection } from './AddElementSection';
import { type CanvasItem } from '../types';
import './CenterCanvas.css';

interface CenterCanvasProps {
  items: CanvasItem[];
  formId: string;
  selectedItemId: string | null;
  draggedItemId: string | null;
  isAnyCardDragging: boolean;
  onSelectItem: (itemId: string) => void;
  onUpdateItem: (itemId: string, updates: Partial<CanvasItem>) => void;
  onDeleteItem: (itemId: string) => void;
  onAddQuestion: (type?: string, afterId?: string) => void;
  onAddSection: (afterId?: string) => void;
  onReorderItems: (draggedId: string, targetId: string) => void;
  onSetDraggedItem: (itemId: string | null) => void;
  isCreating: boolean;
  isSaving: boolean;
  justSaved: boolean;
}

export const CenterCanvas: React.FC<CenterCanvasProps> = ({
  items,
  formId,
  selectedItemId,
  draggedItemId,
  isAnyCardDragging,
  onSelectItem,
  onUpdateItem,
  onDeleteItem,
  onAddQuestion,
  onAddSection,
  onReorderItems,
  onSetDraggedItem,
  isCreating,
  isSaving,
  justSaved
}) => {
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<'above' | 'below' | null>(null);

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent, itemId: string) => {
    // Set drag data for proper drag functionality
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', itemId);
    e.dataTransfer.setData('application/json', JSON.stringify({
      type: 'canvas-item',
      itemId: itemId
    }));

    onSetDraggedItem(itemId);
    setDragOverItemId(null);
  }, [onSetDraggedItem]);

  // Handle drag over - immediate response for better UX
  const handleDragOver = useCallback((e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    if (draggedItemId && draggedItemId !== itemId) {
      // Immediate update for responsive drag feedback
      setDragOverItemId(itemId);

      // Determine if we should insert above or below based on mouse position
      const rect = e.currentTarget.getBoundingClientRect();
      const midPoint = rect.top + rect.height / 2;
      const position = e.clientY < midPoint ? 'above' : 'below';
      setDragOverPosition(position);
    }
  }, [draggedItemId]);

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    setDragOverItemId(null);
    setDragOverPosition(null);
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedItemId && draggedItemId !== targetId) {
      onReorderItems(draggedItemId, targetId);
    }
    setDragOverItemId(null);
    setDragOverPosition(null);
    onSetDraggedItem(null);
  }, [draggedItemId, onReorderItems, onSetDraggedItem]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDragOverItemId(null);
    setDragOverPosition(null);
    onSetDraggedItem(null);
  }, [onSetDraggedItem]);

  // Render individual card based on type
  const renderCard = useCallback((item: CanvasItem) => {
    const isSelected = selectedItemId === item.id;
    const isDragging = draggedItemId === item.id;
    const isDragOver = dragOverItemId === item.id;

    switch (item.type) {
      case 'header':
        return (
          <SurveyHeaderCard
            key={item.id}
            item={item}
            formId={formId}
            isSelected={isSelected}
            isAnyCardDragging={isAnyCardDragging}
            onSelect={() => onSelectItem(item.id)}
            onUpdate={(updates) => onUpdateItem(item.id, updates)}
          />
        );

      case 'title-description':
        return (
          <TitleDescriptionCard
            key={item.id}
            item={item}
            formId={formId}
            isSelected={isSelected}
            isDragging={isDragging}
            isDragOver={isDragOver}
            isAnyCardDragging={isAnyCardDragging}
            onSelect={() => onSelectItem(item.id)}
            onUpdate={(updates) => onUpdateItem(item.id, updates)}
            onDelete={() => onDeleteItem(item.id)}
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragOver={(e) => handleDragOver(e, item.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, item.id)}
            onDragEnd={handleDragEnd}
          />
        );

      case 'question':
        return (
          <QuestionCard
            key={item.id}
            item={item}
            formId={formId}
            isSelected={isSelected}
            isDragging={isDragging}
            isDragOver={isDragOver}
            isAnyCardDragging={isAnyCardDragging}
            onSelect={() => onSelectItem(item.id)}
            onUpdate={(updates) => onUpdateItem(item.id, updates)}
            onDelete={() => onDeleteItem(item.id)}
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragOver={(e) => handleDragOver(e, item.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, item.id)}
            onDragEnd={handleDragEnd}
          />
        );

      case 'page-break':
        return (
          <PageBreakCard
            key={item.id}
            item={item}
            formId={formId}
            isSelected={isSelected}
            isDragging={isDragging}
            isDragOver={isDragOver}
            onSelect={() => onSelectItem(item.id)}
            onUpdate={(updates) => onUpdateItem(item.id, updates)}
            onDelete={() => onDeleteItem(item.id)}
            onDragStart={(e) => handleDragStart(e, item.id)}
            onDragOver={(e) => handleDragOver(e, item.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, item.id)}
            onDragEnd={handleDragEnd}
          />
        );

      default:
        return null;
    }
  }, [
    selectedItemId,
    draggedItemId,
    dragOverItemId,
    dragOverPosition,
    onSelectItem,
    onUpdateItem,
    onDeleteItem,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleDragEnd
  ]);

  // Sort items by order
  const sortedItems = [...items].sort((a, b) => a.order - b.order);

  // Empty state when no items
  if (sortedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="text-gray-400 mb-6">
          <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Buat form Anda
        </h3>
        <p className="text-gray-500 text-sm max-w-md mx-auto mb-6 text-center">
          Tambahkan pertanyaan, bagian, dan kustomisasi form Anda untuk memulai.
        </p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => onAddQuestion()}
            disabled={isCreating}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCreating ? 'Membuat...' : 'Tambah Pertanyaan'}
          </button>
          <button
            onClick={() => onAddSection()}
            disabled={isCreating}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isCreating ? 'Membuat...' : 'Tambah Bagian'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col" style={{ gap: '16px' }}>
      {sortedItems.map((item) => {
        const isDragging = draggedItemId === item.id;
        const isDragOver = dragOverItemId === item.id;
        const showInsertionAbove = isDragOver && dragOverPosition === 'above' && !isDragging;
        const showInsertionBelow = isDragOver && dragOverPosition === 'below' && !isDragging;

        return (
          <React.Fragment key={item.id}>
            {/* Insertion Line Above */}
            {showInsertionAbove && (
              <div
                className="w-full h-1 bg-purple-500 rounded-full opacity-80"
                style={{
                  transform: 'scaleX(0.95)',
                  transition: 'all 0.2s ease-out',
                  boxShadow: '0 2px 8px rgba(95, 53, 245, 0.3)'
                }}
              />
            )}

            {/* Card with Floating Add Button */}
            <div className="relative">
              {renderCard(item)}

              {/* Floating Add Element Section - positioned to the right of focused card */}
              {selectedItemId === item.id && !isDragging && (
                <div
                  className="absolute left-full ml-2 z-30"
                  style={{
                    animation: 'slideInRight 0.2s ease-out',
                    top: item.type === 'header' ? '40px' : '0px' // Account for header's mt-10 (40px)
                  }}
                >
                  <AddElementSection
                    onAddQuestion={(type) => onAddQuestion(type, item.id)}
                    onAddSection={() => onAddSection(item.id)}
                    isCreating={isCreating}
                  />
                </div>
              )}
            </div>

            {/* Insertion Line Below */}
            {showInsertionBelow && (
              <div
                className="w-full h-1 bg-purple-500 rounded-full opacity-80"
                style={{
                  transform: 'scaleX(0.95)',
                  transition: 'all 0.2s ease-out',
                  boxShadow: '0 2px 8px rgba(95, 53, 245, 0.3)'
                }}
              />
            )}
          </React.Fragment>
        );
      })}

      {/* Auto-save status indicator */}
      {isSaving && (
        <div className="fixed bottom-4 right-4 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg text-sm shadow-md flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Menyimpan...
        </div>
      )}
      {justSaved && !isSaving && (
        <div className="fixed bottom-4 right-4 bg-green-100 text-green-800 px-4 py-2 rounded-lg text-sm shadow-md flex items-center gap-2">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Tersimpan otomatis
        </div>
      )}
    </div>
  );
};
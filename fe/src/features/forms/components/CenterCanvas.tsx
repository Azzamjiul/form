import React, { useState, useCallback } from 'react';
import { SurveyHeaderCard } from './SurveyHeaderCard';
import { TitleDescriptionCard } from './TitleDescriptionCard';
import { QuestionCard } from './QuestionCard';
import { PageBreakCard } from './PageBreakCard';
import { AddElementSection } from './AddElementSection';
import './CenterCanvas.css';

interface CanvasItem {
  id: string;
  type: 'header' | 'title-description' | 'question' | 'page-break';
  title: string;
  description: string;
  questionType?: string;
  required?: boolean;
  options?: Array<{ id: string; label: string }>;
  sectionNumber?: number;
  totalSections?: number;
  order: number;
  isEditing?: boolean;
  isSelected?: boolean;
  isDragging?: boolean;
}

interface CenterCanvasProps {
  items: CanvasItem[];
  selectedItemId: string | null;
  draggedItemId: string | null;
  onSelectItem: (itemId: string) => void;
  onUpdateItem: (itemId: string, updates: Partial<CanvasItem>) => void;
  onDeleteItem: (itemId: string) => void;
  onAddQuestion: (afterId?: string) => void;
  onAddSection: (afterId?: string) => void;
  onReorderItems: (draggedId: string, targetId: string) => void;
  onSetDraggedItem: (itemId: string | null) => void;
  isCreating: boolean;
  hasUnsavedChanges: boolean;
  lastSavedAt: Date | null;
}

export const CenterCanvas: React.FC<CenterCanvasProps> = ({
  items,
  selectedItemId,
  draggedItemId,
  onSelectItem,
  onUpdateItem,
  onDeleteItem,
  onAddQuestion,
  onAddSection,
  onReorderItems,
  onSetDraggedItem,
  isCreating,
  hasUnsavedChanges,
  lastSavedAt
}) => {
  const [dragOverItemId, setDragOverItemId] = useState<string | null>(null);

  // Handle drag start
  const handleDragStart = useCallback((itemId: string) => {
    onSetDraggedItem(itemId);
    setDragOverItemId(null);
  }, [onSetDraggedItem]);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent, itemId: string) => {
    e.preventDefault();
    if (draggedItemId && draggedItemId !== itemId) {
      setDragOverItemId(itemId);
    }
  }, [draggedItemId]);

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    setDragOverItemId(null);
  }, []);

  // Handle drop
  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedItemId && draggedItemId !== targetId) {
      onReorderItems(draggedItemId, targetId);
    }
    setDragOverItemId(null);
    onSetDraggedItem(null);
  }, [draggedItemId, onReorderItems, onSetDraggedItem]);

  // Handle drag end
  const handleDragEnd = useCallback(() => {
    setDragOverItemId(null);
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
            isSelected={isSelected}
            isDragging={isDragging}
            isDragOver={isDragOver}
            onSelect={() => onSelectItem(item.id)}
            onUpdate={(updates) => onUpdateItem(item.id, updates)}
            onDragStart={() => handleDragStart(item.id)}
            onDragOver={(e) => handleDragOver(e, item.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, item.id)}
            onDragEnd={handleDragEnd}
          />
        );

      case 'title-description':
        return (
          <TitleDescriptionCard
            key={item.id}
            item={item}
            isSelected={isSelected}
            isDragging={isDragging}
            isDragOver={isDragOver}
            onSelect={() => onSelectItem(item.id)}
            onUpdate={(updates) => onUpdateItem(item.id, updates)}
            onDelete={() => onDeleteItem(item.id)}
            onDragStart={() => handleDragStart(item.id)}
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
            isSelected={isSelected}
            isDragging={isDragging}
            isDragOver={isDragOver}
            onSelect={() => onSelectItem(item.id)}
            onUpdate={(updates) => onUpdateItem(item.id, updates)}
            onDelete={() => onDeleteItem(item.id)}
            onDragStart={() => handleDragStart(item.id)}
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
            isSelected={isSelected}
            isDragging={isDragging}
            isDragOver={isDragOver}
            onSelect={() => onSelectItem(item.id)}
            onUpdate={(updates) => onUpdateItem(item.id, updates)}
            onDelete={() => onDeleteItem(item.id)}
            onDragStart={() => handleDragStart(item.id)}
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
        <div className="flex gap-3 justify-center">
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
    <div className="flex flex-col" style={{ gap: '24px' }}>
      {sortedItems.map((item, index) => (
        <React.Fragment key={item.id}>
          {/* Card with Floating Add Button */}
          <div className="relative">
            {renderCard(item)}

            {/* Floating Add Element Section - positioned to the right of focused card */}
            {selectedItemId === item.id && (
              <div
                className="absolute left-full ml-4 z-30"
                style={{
                  animation: 'slideInRight 0.2s ease-out',
                  top: item.type === 'header' ? '40px' : '0px' // Account for header's mt-10 (40px)
                }}
              >
                <AddElementSection
                  onAddQuestion={() => onAddQuestion(item.id)}
                  onAddSection={() => onAddSection(item.id)}
                  isCreating={isCreating}
                />
              </div>
            )}
          </div>
        </React.Fragment>
      ))}

      {/* Status indicator */}
      {hasUnsavedChanges && (
        <div className="fixed bottom-4 right-4 bg-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-sm shadow-md">
          Ada perubahan belum disimpan
        </div>
      )}
    </div>
  );
};
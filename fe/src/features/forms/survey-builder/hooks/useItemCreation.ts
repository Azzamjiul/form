import { useCallback } from 'react';
import { useCanvasContext } from '../context/CanvasContext';
import { CanvasTransformer } from '../utils/transformations';
import { fieldsApi } from '../../api/fields';
import { v4 as uuidv4 } from 'uuid';
import type { CreateFieldRequest } from '../../types';

export interface UseItemCreationResult {
  createQuestion: (type?: string) => Promise<void>;
  createSection: () => Promise<void>;
  isCreating: boolean;
  error: string | null;
}

export function useItemCreation(formId: string): UseItemCreationResult {
  const { state, actions } = useCanvasContext();

  const createQuestion = useCallback(async (questionType: string = 'text') => {
    try {
      // Set creating state
      actions.setCreating(true);
      actions.clearErrors();

      // Get next order number
      const nextOrder = CanvasTransformer.getNextOrderNumber(state.items);

      // Generate temporary ID for local state
      const tempId = `temp-${uuidv4()}`;

      // Create canvas item immediately for responsive UI
      const questionItem = CanvasTransformer.createQuestionItem(tempId, questionType, nextOrder);
      actions.addItem(questionItem);
      actions.markDirty();

      // Prepare field creation request
      const createFieldRequest: CreateFieldRequest = {
        content_type: 'input_field',
        field_type: questionType,
        label: 'Untitled Question',
        description: '',
        order_global: nextOrder,
        is_required: false,
        points: 0,
        answer_key: null,
      };

      // Create field on backend
      const response = await fieldsApi.createField(formId, createFieldRequest);

      if (response.success && response.data) {
        // Create new item with real backend data
        const updatedItem = CanvasTransformer.createQuestionItem(
          response.data.field_id,
          response.data.field_type || questionType,
          nextOrder
        );
        updatedItem.title = response.data.label || 'Untitled Question';
        updatedItem.description = response.data.description || '';
        updatedItem.required = response.data.is_required || false;
        updatedItem.points = response.data.points || 0;
        updatedItem.answerKey = response.data.answer_key;

        // Replace the temporary item with the real one
        const updatedItems = state.items.map(item =>
          item.id === tempId ? updatedItem : item
        );
        actions.loadItems(updatedItems);
      } else {
        // Handle creation error
        actions.addError('Failed to create question on backend');
        // Remove the temporary item
        actions.deleteItem(tempId);
      }
    } catch (error) {
      console.error('Error creating question:', error);
      actions.addError(error instanceof Error ? error.message : 'Failed to create question');
    } finally {
      actions.setCreating(false);
    }
  }, [formId, state.items, actions]);

  const createSection = useCallback(async () => {
    try {
      // Set creating state
      actions.setCreating(true);
      actions.clearErrors();

      // Get next order number
      const nextOrder = CanvasTransformer.getNextOrderNumber(state.items);

      // Generate temporary ID for local state
      const tempId = `section-temp-${uuidv4()}`;

      // Create canvas item immediately for responsive UI
      const sectionItem = CanvasTransformer.createSectionItem(tempId, nextOrder);
      actions.addItem(sectionItem);
      actions.markDirty();

      // For sections, we'll simulate creation for now since sections API might not be available
      // In a real implementation, you would call sectionsApi.createSection(formId, sectionRequest)

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Update the temporary item with final data
      actions.updateItem(tempId, {
        id: `section-${uuidv4()}`,
        title: 'Untitled Section',
        description: '',
      });

    } catch (error) {
      console.error('Error creating section:', error);
      actions.addError(error instanceof Error ? error.message : 'Failed to create section');
    } finally {
      actions.setCreating(false);
    }
  }, [state.items, actions]);

  return {
    createQuestion,
    createSection,
    isCreating: state.ui.isCreating,
    error: state.ui.errors.length > 0 ? state.ui.errors[0] : null,
  };
}
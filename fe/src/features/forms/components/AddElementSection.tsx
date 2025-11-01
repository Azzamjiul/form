import React from 'react';

interface AddElementSectionProps {
  onAddQuestion: (type?: string) => void;
  onAddSection: () => void;
  isCreating: boolean;
}

export const AddElementSection: React.FC<AddElementSectionProps> = ({
  onAddQuestion,
  onAddSection,
  isCreating
}) => {
  const handleAddQuestion = () => {
    // Default to short answer type
    onAddQuestion('text');
  };

  return (
    <div
      className="bg-white border border-gray-300 rounded-lg shadow-sm"
      style={{
        padding: '8px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        minWidth: '48px'
      }}
    >
      {/* Add Question Button */}
      <button
        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-all duration-200"
        onClick={handleAddQuestion}
        disabled={isCreating}
        title="Add question"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Add Section Button */}
      <button
        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-all duration-200"
        onClick={onAddSection}
        disabled={isCreating}
        title="Add section"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </button>

      {/* Add Description Button */}
      <button
        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-all duration-200"
        onClick={() => {
          // TODO: Implement description element
          console.log('Add description clicked');
        }}
        disabled={isCreating}
        title="Add description"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
        </svg>
      </button>

      {/* Add Image Button */}
      <button
        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-all duration-200"
        onClick={() => {
          // TODO: Implement image element
          console.log('Add image clicked');
        }}
        disabled={isCreating}
        title="Add image"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </button>

      {/* Add Video Button */}
      <button
        className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-all duration-200"
        onClick={() => {
          // TODO: Implement video element
          console.log('Add video clicked');
        }}
        disabled={isCreating}
        title="Add video"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      </button>

    </div>
  );
};
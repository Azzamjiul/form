import React from "react";
import type { EmptyStateProps } from "./EmptyState.types";

export const EmptyState: React.FC<EmptyStateProps> = ({ formId: _formId }) => {
  return (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        <svg
          className="w-16 h-16 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Start building your form
      </h3>
      <p className="text-gray-500 mb-6">
        Add questions to get started with your form.
      </p>
      <div className="flex justify-center gap-3">
        <button
          onClick={() => {
            console.log("Add question clicked");
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Add Question
        </button>
        <button
          onClick={() => {
            console.log("Add section clicked");
          }}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          Add Section
        </button>
      </div>
    </div>
  );
};
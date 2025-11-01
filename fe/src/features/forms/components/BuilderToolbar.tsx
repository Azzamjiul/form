import React from 'react';
import { Button } from '../../../components/ui';

interface BuilderToolbarProps {
  onAddSection: () => void;
  onAddQuestion: () => void;
  onAddImage: () => void;
  onAddVideo: () => void;
  onCustomize: () => void;
}

export const BuilderToolbar: React.FC<BuilderToolbarProps> = ({
  onAddSection,
  onAddQuestion,
  onAddImage,
  onAddVideo,
  onCustomize,
}) => {
  const toolbarItems = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
      label: 'Add question',
      onClick: onAddQuestion,
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Add section',
      onClick: onAddSection,
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      label: 'Add title or description',
      onClick: () => console.log('Add title clicked'),
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      label: 'Add image',
      onClick: onAddImage,
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      label: 'Add video',
      onClick: onAddVideo,
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
      label: 'Customize form',
      onClick: onCustomize,
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      ),
      label: 'More options',
      onClick: () => console.log('More options clicked'),
    },
  ];

  return (
    <div className="w-20 bg-white border-l border-gray-200 fixed right-0 top-0 h-screen z-10 flex flex-col">
      <div className="flex-1 py-4">
        <div className="space-y-2">
          {toolbarItems.map((item, index) => (
            <div key={index} className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={item.onClick}
                className="w-12 h-12 flex items-center justify-center rounded-lg hover:bg-gray-100 group relative"
                title={item.label}
              >
                <div className="text-gray-600 group-hover:text-purple-600 transition-colors">
                  {item.icon}
                </div>

                {/* Tooltip */}
                <div className="absolute right-full mr-2 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    {item.label}
                  </div>
                </div>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
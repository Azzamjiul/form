import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import type { FormWithSections } from "../types";
import { Button } from "../../../components/ui";
import { ShareModal } from "./ShareModal";
import { SettingsModal } from "./SettingsModal";
import { useResponsive } from "../../../hooks/useResponsive";

interface TopNavigationProps {
  form: FormWithSections;
  onFormUpdate: (data: { title?: string; description?: string }) => void;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({
  form,
  onFormUpdate,
}) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState(form.title || "");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { isMobile, isTablet } = useResponsive();

  // Update title when form changes
  useEffect(() => {
    setTitle(form.title || "");
  }, [form.title]);

  // Extract plain text from HTML for display
  const getPlainText = (html: string) => {
    const div = document.createElement("div");
    div.innerHTML = html || "";
    return div.textContent || div.innerText || "";
  };

  const handleTitleChange = (e: React.FocusEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    const newTitleHtml = newTitle.replace(/\n/g, "<br>");
    setTitle(newTitleHtml);
    if (newTitleHtml !== (form.title || "")) {
      onFormUpdate({ title: newTitleHtml });
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
      setIsEditingTitle(false);
    }
    if (e.key === "Escape") {
      setTitle(form.title || "");
      setIsEditingTitle(false);
    }
  };

  const handleTitleClick = () => {
    // When starting to edit, convert HTML to plain text for the input
    const plainTextTitle = getPlainText(title || "");
    setTitle(plainTextTitle);
    setIsEditingTitle(true);
  };

  const getShareUrl = () => {
    return `${window.location.origin}/forms/${form.form_id}/share`;
  };

  return (
    <>
      {/* Top Navigation Bar - Responsive */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 shadow-sm z-20">
        {/* Desktop/Tablet Layout */}
        {!isMobile && (
          <div className="h-14 flex items-center justify-between px-4">
            {/* Left Section - Back Button */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/forms")}
                className="mr-4"
              >
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back
              </Button>
            </div>

            {/* Center Section - Form Title */}
            <div className="flex-1 max-w-md mx-8">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleChange}
                  onKeyDown={handleTitleKeyDown}
                  className={`w-full border-2 border-purple-600 focus:outline-none transition-colors bg-transparent ${
                    isTablet ? "text-lg font-semibold" : "text-xl font-bold"
                  } text-center`}
                  placeholder="Untitled Form"
                  autoFocus
                />
              ) : (
                <div
                  onClick={handleTitleClick}
                  className={`w-full border-2 border-transparent hover:border-gray-300 cursor-pointer transition-colors bg-transparent ${
                    isTablet ? "text-lg font-semibold" : "text-xl font-bold"
                  } text-center truncate px-2 py-1`}
                  title="Click to edit title"
                >
                  {title ? (
                    <span dangerouslySetInnerHTML={{ __html: title }} />
                  ) : (
                    <span className="text-gray-400">Untitled Form</span>
                  )}
                </div>
              )}
            </div>

            {/* Right Section - Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Settings Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettingsModal(true)}
                className="p-2"
                title="Settings"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </Button>

              {/* Share/Send Button */}
              <Button
                onClick={() => setShowShareModal(true)}
                className="bg-purple-600 text-white hover:bg-purple-700"
              >
                {!isTablet && (
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                    />
                  </svg>
                )}
                Send
              </Button>
            </div>
          </div>
        )}

        {/* Mobile Layout */}
        {isMobile && (
          <div className="flex items-center justify-between p-3">
            {/* Left - Back Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/forms")}
              className="p-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
            </Button>

            {/* Center - Form Title */}
            <div className="flex-1 mx-3">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleChange}
                  onKeyDown={handleTitleKeyDown}
                  className="w-full text-base font-semibold text-center border-2 border-purple-600 focus:outline-none transition-colors bg-transparent"
                  placeholder="Untitled Form"
                  autoFocus
                />
              ) : (
                <div
                  onClick={handleTitleClick}
                  className="w-full text-base font-semibold text-center border-2 border-transparent hover:border-gray-300 cursor-pointer transition-colors bg-transparent truncate px-2 py-1"
                  title="Click to edit title"
                >
                  {title ? (
                    <span dangerouslySetInnerHTML={{ __html: title }} />
                  ) : (
                    <span className="text-gray-400">Untitled Form</span>
                  )}
                </div>
              )}
            </div>

            {/* Right - Send Button */}
            <Button
              onClick={() => setShowShareModal(true)}
              size="sm"
              className="bg-purple-600 text-white hover:bg-purple-700 px-3"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684z"
                />
              </svg>
            </Button>
          </div>
        )}
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        shareUrl={getShareUrl()}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        form={form}
        onFormUpdate={onFormUpdate}
      />
    </>
  );
};

import React, { useState } from 'react';
import { Dialog, Button, Input } from '../../../components/ui';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  shareUrl: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  shareUrl,
}) => {
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const handleSendEmail = () => {
    console.log('Send email to:', email);
    // TODO: Implement email sending functionality
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Share"
      size="md"
    >
      <div className="space-y-6">
        {/* Link Sharing Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Link to your form</h3>
          <div className="flex gap-2">
            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="flex-1"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {copied ? 'Copied!' : 'Copy link'}
            </Button>
          </div>
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 truncate font-mono">
              {shareUrl}
            </p>
          </div>
        </div>

        {/* Email Sharing Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Send form</h3>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className="mb-3"
          />
          <Button
            onClick={handleSendEmail}
            className="w-full"
            disabled={!email}
          >
            Send
          </Button>
        </div>

        {/* Permissions Section */}
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-3">Who can access</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="access"
                defaultChecked
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Anyone with the link</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="access"
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Only specified people</span>
            </label>
          </div>

          <div className="mt-4 space-y-2">
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm text-gray-700">Collect email addresses</span>
            </label>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              <span className="text-sm text-gray-700">Allow users to edit responses</span>
            </label>
          </div>
        </div>
      </div>
    </Dialog>
  );
};
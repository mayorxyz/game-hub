import React from 'react';

interface ModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  onClose: () => void;
  children?: React.ReactNode;
}

export default function Modal({ isOpen, title, message, onClose, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-gray-800 border border-gray-700 rounded-2xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
        {message && <p className="text-gray-400 mb-4">{message}</p>}
        {children}
        <button
          onClick={onClose}
          className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}

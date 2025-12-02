import React from 'react';

export default function ImageModal({ imageUrl, onClose }) {
    if (!imageUrl) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div className="relative max-w-4xl w-full max-h-screen flex items-center justify-center">
                <button
                    onClick={onClose}
                    className="absolute -top-10 right-0 text-white hover:text-gray-300 transition"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <img
                    src={imageUrl}
                    alt="Full screen"
                    className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>
        </div>
    );
}

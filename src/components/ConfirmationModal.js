import React from 'react';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, title, message }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full overflow-hidden transform transition-all scale-100 opacity-100">
                <div className="p-6 text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-lg leading-6 font-bold text-gray-900 mb-2">{title}</h3>
                    <p className="text-sm text-gray-500 mb-6">{message}</p>

                    <div className="flex space-x-3 justify-center">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={onConfirm}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-md hover:shadow-lg"
                        >
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

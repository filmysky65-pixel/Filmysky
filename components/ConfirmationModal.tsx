
import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-[1500] p-4">
            <div className="bg-[var(--card-bg)] rounded-lg p-6 max-w-sm w-full">
                <h2 className="text-xl font-bold mb-4">{title}</h2>
                <p className="text-[var(--secondary-text-color)] mb-6">{message}</p>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="bg-[var(--border-color)] px-4 py-2 rounded-lg">Cancel</button>
                    <button onClick={onConfirm} className="bg-red-600 text-white px-4 py-2 rounded-lg">Confirm</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;
import React, { useEffect, useState } from 'react';

type NotificationProps = {
message: string;
type: 'success' | 'error';
onClose?: () => void;
};

export type NotificationType = {
    message: string;
    type: 'success' | 'error';
};

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
const [isVisible, setIsVisible] = useState(true);

useEffect(() => {
    const timer = setTimeout(() => {
    setIsVisible(false);
    if (onClose) {
        onClose();
    }
    }, 3000);

    return () => clearTimeout(timer);
}, [onClose]);

if (!isVisible) return null;

const bgColor = type === 'success' ? 'bg-yellow-500' : 'bg-red-500';
const textColor = 'text-white';

return (
    <div
    className={`fixed bottom-4 left-4 p-4 rounded-lg shadow-lg flex items-center justify-between z-50 ${bgColor} ${textColor}`}
    role="alert"
    >
    <span>{message}</span>
    <button
        onClick={() => {
        setIsVisible(false);
        if (onClose) {
            onClose();
        }
        }}
        className="ml-4 text-white hover:text-gray-100 focus:outline-none"
        aria-label="Close notification"
    >
        &times;
    </button>
    </div>
);
};

export default Notification;
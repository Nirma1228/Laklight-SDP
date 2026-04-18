import { useEffect } from 'react'
import './Toast.css'

function Toast({ message, type = 'info', onClose, duration = 3000 }) {
    useEffect(() => {
        if (duration > 0) {
            const timer = setTimeout(() => {
                onClose()
            }, duration)
            return () => clearTimeout(timer)
        }
    }, [duration, onClose])

    const getIcon = () => {
        switch (type) {
            case 'success':
                return '✓'
            case 'error':
                return '✕'
            case 'warning':
                return '⚠'
            default:
                return 'ℹ'
        }
    }

    const getColor = () => {
        switch (type) {
            case 'success':
                return '#2e7d32'
            case 'error':
                return '#dc2626'
            case 'warning':
                return '#f59e0b'
            default:
                return '#3b82f6'
        }
    }

    return (
        <div className="toast-overlay" onClick={onClose}>
            <div
                className="toast-container"
                onClick={(e) => e.stopPropagation()}
                style={{ borderLeft: `4px solid ${getColor()}` }}
            >
                <div className="toast-icon" style={{ backgroundColor: getColor() }}>
                    {getIcon()}
                </div>
                <div className="toast-content">
                    <p className="toast-message">{message}</p>
                </div>
                <button className="toast-close" onClick={onClose}>×</button>
            </div>
        </div>
    )
}

export default Toast

import { useState } from 'react';

const CardPaymentForm = ({ amount, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        cardNumber: '',
        expiry: '',
        cvc: '',
        name: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        // Format card number with spaces
        if (name === 'cardNumber') {
            const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            const matches = v.match(/\d{4,16}/g);
            const match = (matches && matches[0]) || '';
            const parts = [];

            for (let i = 0, len = match.length; i < len; i += 4) {
                parts.push(match.substring(i, i + 4));
            }

            if (parts.length > 0) {
                setFormData({ ...formData, [name]: parts.join(' ') });
            } else {
                setFormData({ ...formData, [name]: v });
            }
        } else if (name === 'expiry') {
            const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
            if (v.length <= 2) {
                setFormData({ ...formData, [name]: v });
            } else {
                setFormData({ ...formData, [name]: v.substring(0, 2) + '/' + v.substring(2, 4) });
            }
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simulate payment processing
        const btn = e.target.querySelector('button[type="submit"]');
        const originalText = btn.innerText;
        btn.innerText = 'Processing...';
        btn.disabled = true;

        setTimeout(() => {
            onSuccess();
        }, 2000);
    };

    return (
        <div className="card-payment-form">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label>Cardholder Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Card Number</label>
                    <div className="payment-input-container">
                        <input
                            type="text"
                            name="cardNumber"
                            placeholder="0000 0000 0000 0000"
                            value={formData.cardNumber}
                            onChange={handleChange}
                            maxLength="19"
                            required
                        />
                        <span className="card-icon-overlay">💳</span>
                    </div>
                </div>
                <div className="payment-form-row">
                    <div className="form-group">
                        <label>Expiry (MM/YY)</label>
                        <input
                            type="text"
                            name="expiry"
                            placeholder="MM/YY"
                            value={formData.expiry}
                            onChange={handleChange}
                            maxLength="5"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>CVC</label>
                        <input
                            type="text"
                            name="cvc"
                            placeholder="123"
                            value={formData.cvc}
                            onChange={handleChange}
                            maxLength="3"
                            required
                        />
                    </div>
                </div>
                <div className="payment-btn-container">
                    <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={onCancel}
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary"
                    >
                        Pay LKR {amount.toFixed(2)}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CardPaymentForm;

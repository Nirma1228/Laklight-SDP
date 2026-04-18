import { useEffect } from 'react';
import { config } from '../config';

const StripeCheckoutButton = ({ amount, orderId, onSuccess }) => {
  useEffect(() => {
    if (!window.Stripe) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleClick = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await fetch(`${config.API_BASE_URL}/payments/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ amount, orderId })
      });

      const data = await response.json();

      if (data.sessionId) {
        const stripe = window.Stripe(data.publishableKey);
        const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
        if (error) {
          console.error('Stripe Redirect Error:', error);
          alert(`Stripe Error: ${error.message}`);
        }
      } else {
        // Show the specific error message from backend if available
        const errorMsg = data.error ? `${data.message}: ${data.error}` : data.message;
        alert(errorMsg || 'Failed to initiate payment.');
      }
    } catch (err) {
      console.error('Payment Error:', err);
      alert('An error occurred during payment initiation.');
    }
  };

  return (
    <button className="btn btn-primary" onClick={handleClick} style={{ width: '100%' }}>
      Pay Securely Online
    </button>
  );
};

export default StripeCheckoutButton;

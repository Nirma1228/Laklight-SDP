import { useEffect } from 'react';

const StripeCheckoutButton = ({ amount, onSuccess }) => {
  useEffect(() => {
    if (!window.Stripe) {
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  const handleClick = async () => {
    // Call backend to create a Stripe Checkout session
    const response = await fetch('http://localhost:5000/api/payment/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    });
    const data = await response.json();
    if (data.sessionId) {
      const stripe = window.Stripe(data.publishableKey);
      stripe.redirectToCheckout({ sessionId: data.sessionId });
    } else {
      alert('Failed to initiate payment.');
    }
  };

  return (
    <button className="btn btn-primary" onClick={handleClick} style={{ width: '100%' }}>
      Pay with Stripe
    </button>
  );
};

export default StripeCheckoutButton;

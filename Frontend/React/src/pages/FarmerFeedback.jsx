import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './FarmerFeedback.css';

function FarmerFeedback() {
  const [feedbackType, setFeedbackType] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [rating, setRating] = useState(0);
  const [formData, setFormData] = useState({
    clarity: '',
    understanding: '',
    reapply: '',
    comments: '',
    contact: 'yes',
    communication: '',
    process: '',
    inspection: '',
    payment: '',
    future: '',
    improvements: ''
  });

  const selectFeedbackType = (type) => {
    setFeedbackType(type);
    setRating(0);
    setFormData({
      clarity: '',
      understanding: '',
      reapply: '',
      comments: '',
      contact: 'yes',
      communication: '',
      process: '',
      inspection: '',
      payment: '',
      future: '',
      improvements: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.comments.length < 20) {
      alert('Please provide more detailed comments (minimum 20 characters)');
      return;
    }
    if (rating === 0 && feedbackType === 'rejection') {
      alert('Please rate your experience');
      return;
    }
    setShowSuccess(true);
    setTimeout(() => {
      window.location.href = '/farmer-dashboard';
    }, 2000);
  };

  const handleRatingClick = (value) => {
    setRating(value);
  };

  return (
    <div className="farmer-feedback">
      <Header isLoggedIn={true} />
      
      <main className="main-content">
        <div className="feedback-header">
          <h1>Submit Feedback</h1>
          <p>Your feedback helps us improve our services and collaboration with suppliers</p>
        </div>

        {/* Feedback Type Selection */}
        <div className="feedback-type-section">
          <h2 className="section-title">Select Feedback Type</h2>
          <div className="feedback-type-cards">
            <div 
              className={`type-card ${feedbackType === 'rejection' ? 'active' : ''}`}
              onClick={() => selectFeedbackType('rejection')}
            >
              <div className="type-icon">❌</div>
              <h3>Application Rejected</h3>
              <p>Provide feedback about your rejected supplier application</p>
            </div>
            <div 
              className={`type-card ${feedbackType === 'delivery' ? 'active' : ''}`}
              onClick={() => selectFeedbackType('delivery')}
            >
              <div className="type-icon">✅</div>
              <h3>Delivery Completed</h3>
              <p>Share your experience after completing a delivery</p>
            </div>
          </div>
        </div>

        {/* Application Rejection Feedback Form */}
        {feedbackType === 'rejection' && (
          <div className="feedback-form-section active">
            <h2 className="section-title">Application Rejection Feedback</h2>
            
            <div className="alert alert-danger">
              <i className="alert-icon">⚠️</i>
              <div>
                <strong>Application Rejected</strong>
                <p>We understand this is disappointing. Your feedback will help us improve our evaluation process.</p>
              </div>
            </div>

            <div className="rejection-details">
              <h4>Application Details</h4>
              <div className="info-row">
                <span className="info-label">Application ID:</span>
                <span className="info-value">APP-2025-0156</span>
              </div>
              <div className="info-row">
                <span className="info-label">Submission Date:</span>
                <span className="info-value">March 15, 2025</span>
              </div>
              <div className="info-row">
                <span className="info-label">Rejection Date:</span>
                <span className="info-value">March 20, 2025</span>
              </div>
              <div className="info-row">
                <span className="info-label">Rejection Reason:</span>
                <span className="info-value">Quality standards not met</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Was the rejection reason clear? <span className="required">*</span></label>
                <select 
                  value={formData.clarity} 
                  onChange={(e) => setFormData({...formData, clarity: e.target.value})}
                  required
                >
                  <option value="">Select an option...</option>
                  <option value="very-clear">Very Clear</option>
                  <option value="somewhat-clear">Somewhat Clear</option>
                  <option value="unclear">Unclear</option>
                  <option value="very-unclear">Very Unclear</option>
                </select>
              </div>

              <div className="form-group">
                <label>Do you understand what improvements are needed? <span className="required">*</span></label>
                <select 
                  value={formData.understanding}
                  onChange={(e) => setFormData({...formData, understanding: e.target.value})}
                  required
                >
                  <option value="">Select an option...</option>
                  <option value="yes-completely">Yes, Completely</option>
                  <option value="yes-mostly">Yes, Mostly</option>
                  <option value="partially">Partially</option>
                  <option value="not-at-all">Not at All</option>
                </select>
              </div>

              <div className="form-group">
                <label>Overall Process Satisfaction</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= rating ? 'active' : ''}`}
                      onClick={() => handleRatingClick(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Additional Comments or Suggestions <span className="required">*</span></label>
                <textarea
                  value={formData.comments}
                  onChange={(e) => setFormData({...formData, comments: e.target.value})}
                  required
                  placeholder="Please share your thoughts about the rejection..."
                  minLength={20}
                />
                <div className="form-description">Minimum 20 characters</div>
              </div>

              <div className="btn-group">
                <button type="button" className="btn btn-secondary" onClick={() => setFeedbackType(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Submit Feedback</button>
              </div>
            </form>
          </div>
        )}

        {/* Delivery Completed Feedback Form */}
        {feedbackType === 'delivery' && (
          <div className="feedback-form-section active">
            <h2 className="section-title">Delivery Completion Feedback</h2>
            
            <div className="alert alert-info">
              <i className="alert-icon">ℹ️</i>
              <div>
                <strong>Thank You for Your Delivery!</strong>
                <p>Your feedback helps us improve our supply chain process.</p>
              </div>
            </div>

            <div className="delivery-details">
              <h4>Delivery Details</h4>
              <div className="info-row">
                <span className="info-label">Delivery ID:</span>
                <span className="info-value">DEL-2025-0234</span>
              </div>
              <div className="info-row">
                <span className="info-label">Delivery Date:</span>
                <span className="info-value">March 20, 2025</span>
              </div>
              <div className="info-row">
                <span className="info-label">Product Type:</span>
                <span className="info-value">Fresh Mangoes</span>
              </div>
              <div className="info-row">
                <span className="info-label">Quantity Delivered:</span>
                <span className="info-value">250 kg</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Overall Delivery Experience <span className="required">*</span></label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= rating ? 'active' : ''}`}
                      onClick={() => handleRatingClick(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Communication with Staff <span className="required">*</span></label>
                <select 
                  value={formData.communication}
                  onChange={(e) => setFormData({...formData, communication: e.target.value})}
                  required
                >
                  <option value="">Select rating...</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="average">Average</option>
                  <option value="poor">Poor</option>
                </select>
              </div>

              <div className="form-group">
                <label>Delivery Process Smoothness <span className="required">*</span></label>
                <select 
                  value={formData.process}
                  onChange={(e) => setFormData({...formData, process: e.target.value})}
                  required
                >
                  <option value="">Select rating...</option>
                  <option value="very-smooth">Very Smooth</option>
                  <option value="smooth">Smooth</option>
                  <option value="acceptable">Acceptable</option>
                  <option value="difficult">Difficult</option>
                </select>
              </div>

              <div className="form-group">
                <label>Additional Comments <span className="required">*</span></label>
                <textarea
                  value={formData.comments}
                  onChange={(e) => setFormData({...formData, comments: e.target.value})}
                  required
                  placeholder="Share your experience, suggestions..."
                  minLength={20}
                />
              </div>

              <div className="btn-group">
                <button type="button" className="btn btn-secondary" onClick={() => setFeedbackType(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Submit Feedback</button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* Success Modal */}
      {showSuccess && (
        <div className="modal-overlay">
          <div className="success-modal">
            <div className="success-icon">✓</div>
            <h2>Feedback Submitted Successfully!</h2>
            <p>Thank you for your valuable feedback.</p>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default FarmerFeedback;

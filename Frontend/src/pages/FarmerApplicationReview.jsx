import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './FarmerApplicationReview.css';

function FarmerApplicationReview() {
  const [applications, setApplications] = useState([
    {
      id: 1,
      farmerName: 'Asoka Perera',
      farmName: 'Farm Fresh Products',
      applicationDate: '2025-01-15',
      farmSize: '50 acres',
      location: 'Colombo District',
      productTypes: 'Vegetables, Fruits',
      status: 'Pending Review'
    },
    {
      id: 2,
      farmerName: 'Maria Silva',
      farmName: 'Green Valley Farm',
      applicationDate: '2025-01-14',
      farmSize: '25 acres',
      location: 'Kandy District',
      productTypes: 'Tea, Spices',
      status: 'Under Review'
    }
  ]);

  const [selectedApp, setSelectedApp] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const viewDetails = (app) => {
    setSelectedApp(app);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedApp(null);
  };

  const handleApprove = (id) => {
    if (window.confirm('Are you sure you want to approve this application?')) {
      setApplications(applications.filter(app => app.id !== id));
      alert('Application approved successfully!');
    }
  };

  const handleReject = (id) => {
    const reason = window.prompt('Please enter rejection reason:');
    if (reason) {
      setApplications(applications.filter(app => app.id !== id));
      alert(`Application rejected. Reason: ${reason}`);
    }
  };

  return (
    <div className="farmer-application-review">
      <Header isLoggedIn={true} />
      
      <div className="review-container">
        <h2>Farmer Application Review</h2>
        
        {applications.map(app => (
          <div key={app.id} className="application-card">
            <div className="application-header">
              <h3>{app.farmerName} - {app.farmName}</h3>
              <span className={`status-badge ${app.status === 'Pending Review' ? 'status-pending' : 'status-reviewed'}`}>
                {app.status}
              </span>
            </div>
            <p><strong>Application Date:</strong> {app.applicationDate}</p>
            <p><strong>Farm Size:</strong> {app.farmSize}</p>
            <p><strong>Location:</strong> {app.location}</p>
            <p><strong>Product Types:</strong> {app.productTypes}</p>
            <div className="application-actions">
              <button className="view-btn" onClick={() => viewDetails(app)}>View Details</button>
              <button className="approve-btn" onClick={() => handleApprove(app.id)}>Approve</button>
              <button className="reject-btn" onClick={() => handleReject(app.id)}>Reject</button>
            </div>
          </div>
        ))}

        {applications.length === 0 && (
          <div className="no-applications">
            <p>No pending applications at the moment.</p>
          </div>
        )}
      </div>

      {showModal && selectedApp && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Application Details</h2>
              <button className="close-btn" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <p><strong>Farmer Name:</strong> {selectedApp.farmerName}</p>
              <p><strong>Farm Name:</strong> {selectedApp.farmName}</p>
              <p><strong>Farm Size:</strong> {selectedApp.farmSize}</p>
              <p><strong>Location:</strong> {selectedApp.location}</p>
              <p><strong>Product Types:</strong> {selectedApp.productTypes}</p>
              <p><strong>Application Date:</strong> {selectedApp.applicationDate}</p>
              <p><strong>Status:</strong> {selectedApp.status}</p>
            </div>
            <div className="modal-actions">
              <button className="approve-btn" onClick={() => { handleApprove(selectedApp.id); closeModal(); }}>
                Approve Application
              </button>
              <button className="reject-btn" onClick={() => { handleReject(selectedApp.id); closeModal(); }}>
                Reject Application
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default FarmerApplicationReview;

import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import './SystemSettings.css';

function SystemSettings() {
  const [activeSection, setActiveSection] = useState('general');
  const [settings, setSettings] = useState({
    companyName: 'Laklight Food Products',
    companyEmail: 'info@laklights.lk',
    companyPhone: '0721267405',
    companyWebsite: 'https://laklights.lk',
    companyAddress: 'Gokaralla Road, Kadulawa, Ibbagamuwa',
    systemTimezone: 'Asia/Colombo',
    systemLanguage: 'en',
    systemCurrency: 'LKR',
    dateFormat: 'DD/MM/YYYY',
    onlineStore: true,
    wholesalePricing: true,
    guestCheckout: false,
    wholesaleThreshold: 12,
    wholesaleDiscount: 15,
    taxRate: 0,
    deliveryCharge: 200
  });

  const [toggles, setToggles] = useState({
    onlineStore: true,
    wholesalePricing: true,
    guestCheckout: false,
    lowStockAlerts: true,
    expiryDateAlerts: true,
    cashOnDelivery: true,
    onlineBanking: true,
    cardPayments: true
  });

  const toggleSwitch = (key) => {
    setToggles({...toggles, [key]: !toggles[key]});
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings({...settings, [name]: value});
  };

  const handleSave = (section) => {
    alert(`${section} settings saved successfully!`);
  };

  return (
    <div className="system-settings">
      <Header isLoggedIn={true} />
      
      <main className="main-content">
        <div className="settings-header">
          <h1>System Settings</h1>
          <p>Configure and manage all aspects of the Laklight Food Products digital platform.</p>
        </div>

        <div className="settings-layout">
          {/* Settings Navigation */}
          <nav className="settings-nav">
            <a 
              href="#general" 
              className={`settings-nav-item ${activeSection === 'general' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveSection('general'); }}
            >
              General Settings
            </a>
            <a 
              href="#ecommerce" 
              className={`settings-nav-item ${activeSection === 'ecommerce' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveSection('ecommerce'); }}
            >
              E-commerce
            </a>
            <a 
              href="#inventory" 
              className={`settings-nav-item ${activeSection === 'inventory' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveSection('inventory'); }}
            >
              Inventory Management
            </a>
            <a 
              href="#suppliers" 
              className={`settings-nav-item ${activeSection === 'suppliers' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveSection('suppliers'); }}
            >
              Supplier Management
            </a>
            <a 
              href="#payments" 
              className={`settings-nav-item ${activeSection === 'payments' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveSection('payments'); }}
            >
              Payment Settings
            </a>
            <a 
              href="#security" 
              className={`settings-nav-item ${activeSection === 'security' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveSection('security'); }}
            >
              Security & Access
            </a>
          </nav>

          {/* Settings Content */}
          <div className="settings-content">
            {/* General Settings */}
            {activeSection === 'general' && (
              <section className="settings-section">
                <div className="section-header">
                  <h2>General Settings</h2>
                  <p>Basic company and system configuration settings.</p>
                </div>

                <div className="config-card">
                  <h4>Company Information</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Company Name</label>
                      <input 
                        type="text" 
                        name="companyName"
                        value={settings.companyName} 
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Contact Email</label>
                      <input 
                        type="email" 
                        name="companyEmail"
                        value={settings.companyEmail}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input 
                        type="tel" 
                        name="companyPhone"
                        value={settings.companyPhone}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label>Website URL</label>
                      <input 
                        type="url" 
                        name="companyWebsite"
                        value={settings.companyWebsite}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>

                <div className="config-card">
                  <h4>System Configuration</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>System Timezone</label>
                      <select name="systemTimezone" value={settings.systemTimezone} onChange={handleInputChange}>
                        <option value="Asia/Colombo">Asia/Colombo (GMT+5:30)</option>
                        <option value="UTC">UTC (GMT+0:00)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Default Language</label>
                      <select name="systemLanguage" value={settings.systemLanguage} onChange={handleInputChange}>
                        <option value="en">English</option>
                        <option value="si">Sinhala</option>
                        <option value="ta">Tamil</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="btn-group">
                  <button className="btn btn-primary" onClick={() => handleSave('General')}>Save Changes</button>
                  <button className="btn btn-secondary">Reset to Default</button>
                </div>
              </section>
            )}

            {/* E-commerce Settings */}
            {activeSection === 'ecommerce' && (
              <section className="settings-section">
                <div className="section-header">
                  <h2>E-commerce Settings</h2>
                  <p>Configure online store settings, pricing, and customer features.</p>
                </div>

                <div className="config-card">
                  <h4>Store Configuration</h4>
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <h4>Enable Online Store</h4>
                      <p>Allow customers to place orders through the website</p>
                    </div>
                    <div 
                      className={`toggle-switch ${toggles.onlineStore ? 'active' : ''}`}
                      onClick={() => toggleSwitch('onlineStore')}
                    />
                  </div>
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <h4>Wholesale Pricing</h4>
                      <p>Enable automatic discounts for bulk orders (12+ items)</p>
                    </div>
                    <div 
                      className={`toggle-switch ${toggles.wholesalePricing ? 'active' : ''}`}
                      onClick={() => toggleSwitch('wholesalePricing')}
                    />
                  </div>
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <h4>Guest Checkout</h4>
                      <p>Allow customers to checkout without creating an account</p>
                    </div>
                    <div 
                      className={`toggle-switch ${toggles.guestCheckout ? 'active' : ''}`}
                      onClick={() => toggleSwitch('guestCheckout')}
                    />
                  </div>
                </div>

                <div className="config-card">
                  <h4>Pricing & Discounts</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Wholesale Threshold (Items)</label>
                      <input 
                        type="number" 
                        name="wholesaleThreshold"
                        value={settings.wholesaleThreshold}
                        onChange={handleInputChange}
                        min="1"
                      />
                    </div>
                    <div className="form-group">
                      <label>Wholesale Discount (%)</label>
                      <input 
                        type="number" 
                        name="wholesaleDiscount"
                        value={settings.wholesaleDiscount}
                        onChange={handleInputChange}
                        min="0"
                        max="50"
                      />
                    </div>
                  </div>
                </div>

                <div className="btn-group">
                  <button className="btn btn-primary" onClick={() => handleSave('E-commerce')}>
                    Save E-commerce Settings
                  </button>
                </div>
              </section>
            )}

            {/* Inventory Management */}
            {activeSection === 'inventory' && (
              <section className="settings-section">
                <div className="section-header">
                  <h2>Inventory Management</h2>
                  <p>Configure warehouse settings, stock alerts, and expiry management.</p>
                </div>

                <div className="config-card">
                  <h4>Alert Settings</h4>
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <h4>Low Stock Alerts</h4>
                      <p>Notify when product quantity falls below threshold</p>
                    </div>
                    <div 
                      className={`toggle-switch ${toggles.lowStockAlerts ? 'active' : ''}`}
                      onClick={() => toggleSwitch('lowStockAlerts')}
                    />
                  </div>
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <h4>Expiry Date Alerts</h4>
                      <p>Send notifications for products nearing expiry</p>
                    </div>
                    <div 
                      className={`toggle-switch ${toggles.expiryDateAlerts ? 'active' : ''}`}
                      onClick={() => toggleSwitch('expiryDateAlerts')}
                    />
                  </div>
                </div>

                <div className="btn-group">
                  <button className="btn btn-primary" onClick={() => handleSave('Inventory')}>
                    Save Inventory Settings
                  </button>
                </div>
              </section>
            )}

            {/* Supplier Management */}
            {activeSection === 'suppliers' && (
              <section className="settings-section">
                <div className="section-header">
                  <h2>Supplier Management</h2>
                  <p>Configure supplier application process and quality standards.</p>
                </div>

                <div className="config-card">
                  <h4>Application Process</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Minimum Experience (Years)</label>
                      <input type="number" defaultValue="2" min="0" />
                    </div>
                    <div className="form-group">
                      <label>Minimum Farm Size (Acres)</label>
                      <input type="number" defaultValue="1" min="0" step="0.1" />
                    </div>
                  </div>
                </div>

                <div className="btn-group">
                  <button className="btn btn-primary" onClick={() => handleSave('Supplier')}>
                    Save Supplier Settings
                  </button>
                </div>
              </section>
            )}

            {/* Payment Settings */}
            {activeSection === 'payments' && (
              <section className="settings-section">
                <div className="section-header">
                  <h2>Payment Settings</h2>
                  <p>Configure payment gateways and transaction settings.</p>
                </div>

                <div className="config-card">
                  <h4>Payment Methods</h4>
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <h4>Cash on Delivery</h4>
                      <p>Accept cash payments upon delivery</p>
                    </div>
                    <div 
                      className={`toggle-switch ${toggles.cashOnDelivery ? 'active' : ''}`}
                      onClick={() => toggleSwitch('cashOnDelivery')}
                    />
                  </div>
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <h4>Online Banking</h4>
                      <p>Enable online banking payments</p>
                    </div>
                    <div 
                      className={`toggle-switch ${toggles.onlineBanking ? 'active' : ''}`}
                      onClick={() => toggleSwitch('onlineBanking')}
                    />
                  </div>
                  <div className="toggle-row">
                    <div className="toggle-info">
                      <h4>Card Payments</h4>
                      <p>Accept Visa, MasterCard, and other card payments</p>
                    </div>
                    <div 
                      className={`toggle-switch ${toggles.cardPayments ? 'active' : ''}`}
                      onClick={() => toggleSwitch('cardPayments')}
                    />
                  </div>
                </div>

                <div className="btn-group">
                  <button className="btn btn-primary" onClick={() => handleSave('Payment')}>
                    Save Payment Settings
                  </button>
                </div>
              </section>
            )}

            {/* Security & Access */}
            {activeSection === 'security' && (
              <section className="settings-section">
                <div className="section-header">
                  <h2>Security & Access Control</h2>
                  <p>Manage user permissions, security policies, and access controls.</p>
                </div>

                <div className="config-card">
                  <h4>Password Policy</h4>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Minimum Password Length</label>
                      <input type="number" defaultValue="8" min="6" max="20" />
                    </div>
                    <div className="form-group">
                      <label>Password Expiry (Days)</label>
                      <input type="number" defaultValue="90" min="30" max="365" />
                    </div>
                  </div>
                </div>

                <div className="config-card">
                  <h4>User Roles & Permissions</h4>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Role</th>
                        <th>Users</th>
                        <th>Permissions</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Administrator</td>
                        <td>3</td>
                        <td>Full System Access</td>
                        <td><span className="status-badge status-active">Active</span></td>
                      </tr>
                      <tr>
                        <td>Employee</td>
                        <td>45</td>
                        <td>Inventory, Orders, Suppliers</td>
                        <td><span className="status-badge status-active">Active</span></td>
                      </tr>
                      <tr>
                        <td>Customer</td>
                        <td>1,523</td>
                        <td>Order Placement, Profile</td>
                        <td><span className="status-badge status-active">Active</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="btn-group">
                  <button className="btn btn-primary" onClick={() => handleSave('Security')}>
                    Save Security Settings
                  </button>
                </div>
              </section>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default SystemSettings;

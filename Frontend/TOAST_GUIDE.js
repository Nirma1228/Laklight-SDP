// Quick Reference Guide for Toast Notifications
// =============================================

// 1. Import the useToast hook at the top of your component:
import { useToast } from '../components/ToastNotification'

// 2. Initialize the toast in your component:
const toast = useToast()

// 3. Replace alert() calls with toast methods:

// SUCCESS (green)
// OLD: alert('Profile updated successfully!')
// NEW: toast.success('Profile updated successfully!')

// ERROR (red)
// OLD: alert('Failed to update profile')
// NEW: toast.error('Failed to update profile')

// WARNING (orange)
// OLD: alert('Please fill in all fields')
// NEW: toast.warning('Please fill in all fields')

// INFO (blue)
// OLD: alert('Processing your request...')
// NEW: toast.info('Processing your request...')

// Custom duration (default is 3000ms)
toast.success('Saved!', 5000) // Shows for 5 seconds
toast.error('Error occurred', 0) // Stays until manually closed

// Examples from your code:
// ========================

// Profile Update
if (response.ok) {
    toast.success('Profile updated successfully!')
    setIsEditingProfile(false)
    fetchProfile()
} else {
    const data = await response.json()
    toast.error(data.message || 'Failed to update profile')
}

// Delivery Confirmation
toast.success('✅ Delivery date confirmed! Your product is now scheduled for pickup.')

// Reschedule Request
toast.info('📅 Reschedule request sent! The operations team will review your suggested date.')

// Form Validation
if (validProducts.length === 0) {
    toast.warning('Please fill in at least one complete product form.')
    return
}

// Submission Success
toast.success(`Successfully submitted ${validProducts.length} product(s) to database!`)

// Error Handling
catch (error) {
    console.error('Submission error:', error)
    toast.error(`Failed to submit products: ${error.message}`)
}

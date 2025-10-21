// Audit Log System
// This file handles logging of user activities for teacher monitoring

// Use the Supabase client from auth.js (loaded first)
// No need to create a new client here

// Function to get user's IP address (simplified)
async function getUserIP() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error('Error getting IP:', error);
    return 'Unknown';
  }
}

// Function to log user activity
async function logActivity(activity, details = '', userId = null) {
  try {
    // Get current user if not provided
    if (!userId) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        userId = user.id;
      } else {
        console.warn('No user found for audit log');
        return;
      }
    }

    const ipAddress = await getUserIP();
    const timestamp = new Date().toISOString();

    // For now, we'll store audit logs in localStorage since we don't have a dedicated table
    // In a production environment, you would insert into an audit_logs table
    const auditLog = {
      id: crypto.randomUUID(),
      user_id: userId,
      activity: activity,
      details: details,
      ip_address: ipAddress,
      timestamp: timestamp
    };

    // Store in localStorage (temporary solution)
    const existingLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    existingLogs.push(auditLog);
    
    // Keep only last 1000 logs to prevent localStorage from getting too large
    if (existingLogs.length > 1000) {
      existingLogs.splice(0, existingLogs.length - 1000);
    }
    
    localStorage.setItem('audit_logs', JSON.stringify(existingLogs));
    
    // TODO: In production, store in Supabase audit_logs table using the global supabase client

    console.log('Activity logged:', auditLog);
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

// Function to get audit logs for a specific user
async function getAuditLogs(userId) {
  try {
    const allLogs = JSON.parse(localStorage.getItem('audit_logs') || '[]');
    return allLogs.filter(log => log.user_id === userId);
  } catch (error) {
    console.error('Error getting audit logs:', error);
    return [];
  }
}

// Function to get all audit logs (for admin/teacher view)
async function getAllAuditLogs() {
  try {
    return JSON.parse(localStorage.getItem('audit_logs') || '[]');
  } catch (error) {
    console.error('Error getting all audit logs:', error);
    return [];
  }
}

// Export functions for use in other files
window.auditLog = {
  logActivity,
  getAuditLogs,
  getAllAuditLogs
};

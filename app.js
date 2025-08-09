const express = require('express');
const path = require('path');
const cors = require('cors');
require('dotenv').config();

// Import from db.js
const { supabase, initializeDatabase } = require('./db');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
// Remove the public folder middleware since we don't want it

// Initialize database on startup
async function startServer() {
  console.log('🔄 Starting newsletter server...');
  
  const dbReady = await initializeDatabase();
  
  if (!dbReady) {
    console.log('⚠️  Database not ready, but server will start anyway.');
  }

  // Routes
  app.get('/', (req, res) => {
    // Serve index.html from root directory
    const indexPath = path.join(__dirname, 'index.html');
    res.sendFile(indexPath);
  });

  // Health check endpoint
  app.get('/health', (req, res) => {
    res.json({ 
      status: 'Server is running!', 
      timestamp: new Date().toISOString() 
    });
  });

  // Handle subscription POST
  app.post('/subscribe', async (req, res) => {
    try {
      const { email } = req.body;
      
      // Validation
      if (!email) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email is required' 
        });
      }

      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ 
          success: false, 
          message: 'Please enter a valid email address' 
        });
      }

      console.log('📧 Attempting to subscribe:', email);

      // Insert into Supabase
      const { data, error } = await supabase
        .from('subscribers')
        .insert([{ email: email.toLowerCase().trim() }])
        .select();

      if (error) {
        console.error('Database error:', error);
        
        // Handle unique constraint violation
        if (error.code === '23505' || error.message.includes('duplicate')) {
          return res.status(409).json({ 
            success: false, 
            message: 'Email already subscribed!' 
          });
        }
        
        return res.status(500).json({ 
          success: false, 
          message: 'Database error occurred. Please try again.' 
        });
      }

      console.log('✅ New subscriber added:', data[0]);
      
      res.json({ 
        success: true, 
        message: '🎉 Successfully subscribed! Welcome to TechMaster Weekly!'
      });

    } catch (error) {
      console.error('❌ Server error:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error. Please try again.' 
      });
    }
  });

  // Get subscriber count
  app.get('/subscribers/count', async (req, res) => {
    try {
      const { count, error } = await supabase
        .from('subscribers')
        .select('*', { count: 'exact', head: true });

      if (error) {
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to get subscriber count' 
        });
      }

      res.json({ 
        success: true, 
        count: count || 0
      });
    } catch (error) {
      console.error('Error getting count:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  });

  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log('🚀 Newsletter server started successfully!');
    console.log(`📡 Server running at: http://localhost:${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/health`);
    console.log(`📈 Subscriber count: http://localhost:${PORT}/subscribers/count`);
    console.log('📧 Ready to accept newsletter signups!');
  });
}

// Start the server
startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});
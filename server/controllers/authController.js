const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Class = require('../models/Class');
const Notification = require('../models/Notification');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

// Helper function to check for missed classes
const checkMissedClasses = async (userId, lastLoginDate) => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    // Only check if user was away for more than 1 day
    if (!lastLoginDate || new Date(lastLoginDate) > oneDayAgo) {
      return;
    }

    // Find classes that ended while user was away
    const missedClasses = await Class.find({
      status: 'ended',
      endTime: {
        $gte: lastLoginDate,
        $lte: now
      },
      attendees: userId
    }).select('title startTime endTime');

    if (missedClasses.length > 0) {
      // Create a summary notification
      const classNames = missedClasses.map(c => c.title).slice(0, 3).join(', ');
      const moreCount = missedClasses.length > 3 ? ` and ${missedClasses.length - 3} more` : '';
      
      const notification = new Notification({
        type: 'info',
        message: `📚 You missed ${missedClasses.length} class${missedClasses.length > 1 ? 'es' : ''} while you were away: ${classNames}${moreCount}`,
        receiverId: userId,
        senderId: userId,
        priority: 'normal'
      });

      await notification.save();
      console.log(`✅ Created missed classes notification for user ${userId}`);
    }
  } catch (error) {
    console.error('Error checking missed classes:', error);
  }
};

exports.signup = async (req, res) => {
  const { email, password, name, phoneNo, roleId } = req.body;
  console.log('Signup request:', { email, name, phoneNo, roleId });
  
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  try {
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('User already exists:', email);
      return res.status(409).json({ error: 'User exists' });
    }

    const hash = await bcrypt.hash(password, 10);
    const userData = { 
      email, 
      name: name || '', 
      passwordHash: hash 
    };
    
    // Add optional fields if provided
    if (phoneNo) userData.phoneNo = phoneNo;
    if (roleId) userData.roleId = roleId;
    
    console.log('Creating user with data:', { ...userData, passwordHash: '[HIDDEN]' });
    const user = new User(userData);
    await user.save();
    console.log('User saved successfully:', user._id);

    const token = jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id.toString(), email: user.email, name: user.name, phoneNo: user.phoneNo, roleId: user.roleId } });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Login request for:', email);
  
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });

  try {
    const user = await User.findOne({ email }).populate('roleId', 'name displayName');
    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      console.log('Invalid password for:', email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Login successful for:', email);
    
    // Check for missed classes before updating lastLoginDate
    await checkMissedClasses(user._id, user.lastLoginDate);
    
    // Update last login date
    user.lastLoginDate = new Date();
    await user.save();
    
    const token = jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      token, 
      user: { 
        id: user._id.toString(), 
        email: user.email, 
        name: user.name,
        phoneNo: user.phoneNo,
        role: user.roleId 
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.sub)
      .select('email name phoneNo roleId')
      .populate('roleId', 'name displayName');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ 
      id: user._id.toString(), 
      email: user.email, 
      name: user.name,
      phoneNo: user.phoneNo,
      role: user.roleId 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

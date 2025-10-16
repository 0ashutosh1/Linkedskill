const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

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

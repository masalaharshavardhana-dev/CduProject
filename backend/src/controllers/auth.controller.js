const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const Company = require('../models/Company');

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

exports.register = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      role, 
      fullName, 
      rollNumber, 
      department, 
      graduationYear, 
      cgpa, 
      backlogCount, 
      companyName, 
      industry, 
      location, 
      phone 
    } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, password, and role are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      email,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    let studentProfile = null;
    let company = null;

    if (role === 'STUDENT') {
      studentProfile = new StudentProfile({
        userId: newUser._id,
        fullName: fullName || email.split('@')[0],
        rollNumber: rollNumber || `CDU-${Date.now().toString().slice(-6)}`,
        department: department || 'Computer Science',
        graduationYear: graduationYear ? parseInt(graduationYear) : new Date().getFullYear(),
        cgpa: cgpa !== undefined ? parseFloat(cgpa) : 8.0,
        backlogCount: backlogCount !== undefined ? parseInt(backlogCount) : 0,
        phone: phone || '',
      });
      await studentProfile.save();
    } else if (role === 'RECRUITER') {
      company = new Company({
        name: companyName || `${email.split('@')[0]} Technologies`,
        industry: industry || 'Technology',
        location: location || 'Bangalore / Remote',
        recruiterId: newUser._id,
        status: 'APPROVED',
      });
      await company.save();
    }

    const token = jwt.sign({ id: newUser._id, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ 
      message: 'User registered successfully', 
      token, 
      role: newUser.role,
      user: {
        id: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
      studentProfile,
      company
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials or account inactive' });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    let studentProfile = null;
    let company = null;

    if (user.role === 'STUDENT') {
      studentProfile = await StudentProfile.findOne({ userId: user._id });
    } else if (user.role === 'RECRUITER') {
      company = await Company.findOne({ recruiterId: user._id });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.status(200).json({ 
      message: 'Login successful', 
      token, 
      role: user.role,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      studentProfile,
      company
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });

    let profile = null;
    if (user.role === 'STUDENT') {
      profile = await StudentProfile.findOne({ userId: user._id });
    } else if (user.role === 'RECRUITER') {
      profile = await Company.findOne({ recruiterId: user._id });
    }

    res.status(200).json({ user, profile });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

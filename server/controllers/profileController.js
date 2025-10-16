const Profile = require('../models/Profile');
const User = require('../models/User');

// Create or update profile
exports.createOrUpdateProfile = async (req, res) => {
  try {
    const { name, email, phoneNo, education, areasOfInterest, occupation, designation, linkedin, website, photoUrl } = req.body;
    const userId = req.user.sub;

    // Check if profile already exists
    let profile = await Profile.findOne({ userId });

    if (profile) {
      // Update existing profile
      if (name !== undefined) profile.name = name;
      if (email !== undefined) profile.email = email;
      if (phoneNo !== undefined) profile.phoneNo = phoneNo;
      if (education !== undefined) profile.education = education;
      if (areasOfInterest !== undefined) profile.areasOfInterest = areasOfInterest;
      if (occupation !== undefined) profile.occupation = occupation;
      if (designation !== undefined) profile.designation = designation;
      if (linkedin !== undefined) profile.linkedin = linkedin;
      if (website !== undefined) profile.website = website;
      if (photoUrl !== undefined) profile.photoUrl = photoUrl;

      await profile.save();

      // Also update User collection with name, email, and phoneNo
      const user = await User.findById(userId);
      if (user) {
        if (name !== undefined) user.name = name;
        if (email !== undefined) user.email = email;
        if (phoneNo !== undefined) user.phoneNo = phoneNo;
        await user.save();
      }

      res.json({ 
        message: 'Profile updated successfully', 
        profile 
      });
    } else {
      // If creating new profile, fetch user data to pre-populate
      const user = await User.findById(userId);
      
      // Create new profile with user data as defaults
      profile = new Profile({
        userId,
        name: name || user?.name || '',
        email: email || user?.email || '',
        phoneNo: phoneNo !== undefined ? phoneNo : (user?.phoneNo ? user.phoneNo.toString() : ''),
        education: education || '',
        areasOfInterest: areasOfInterest || [],
        occupation: occupation || '',
        designation: designation || '',
        linkedin: linkedin || '',
        website: website || '',
        photoUrl: photoUrl || ''
      });

      await profile.save();
      res.status(201).json({ 
        message: 'Profile created successfully', 
        profile 
      });
    }
  } catch (err) {
    console.error('Error creating/updating profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get authenticated user's profile
exports.getMyProfile = async (req, res) => {
  try {
    const userId = req.user.sub;
    const profile = await Profile.findOne({ userId }).populate('userId', 'name email phoneNo roleId');

    if (!profile) {
      // If no profile exists, return user data for pre-population
      const user = await User.findById(userId);
      if (user) {
        return res.status(404).json({ 
          error: 'Profile not found',
          userData: {
            name: user.name,
            email: user.email,
            phoneNo: user.phoneNo ? user.phoneNo.toString() : ''
          }
        });
      }
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get profile by user ID
exports.getProfileByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await Profile.findOne({ userId }).populate('userId', 'name email phoneNo roleId');

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ profile });
  } catch (err) {
    console.error('Error fetching profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get all profiles (for admin or search purposes)
exports.getAllProfiles = async (req, res) => {
  try {
    const profiles = await Profile.find().populate('userId', 'name email phoneNo roleId');
    res.json({ profiles });
  } catch (err) {
    console.error('Error fetching profiles:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Search profiles by areas of interest
exports.searchByInterest = async (req, res) => {
  try {
    const { interest } = req.query;
    
    if (!interest) {
      return res.status(400).json({ error: 'Interest query parameter is required' });
    }

    const profiles = await Profile.find({ 
      areasOfInterest: { $regex: interest, $options: 'i' } 
    }).populate('userId', 'name email phoneNo roleId');

    res.json({ profiles, count: profiles.length });
  } catch (err) {
    console.error('Error searching profiles:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Delete profile
exports.deleteProfile = async (req, res) => {
  try {
    const userId = req.user.sub;
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    await Profile.findByIdAndDelete(profile._id);
    res.json({ message: 'Profile deleted successfully' });
  } catch (err) {
    console.error('Error deleting profile:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Check if user has completed profile
exports.checkProfileCompletion = async (req, res) => {
  try {
    const userId = req.user.sub;
    const profile = await Profile.findOne({ userId });

    if (!profile) {
      return res.json({ 
        completed: false, 
        message: 'Profile not created yet' 
      });
    }

    // Check if all required fields are filled
    const isCompleted = profile.education && 
                       profile.areasOfInterest.length > 0 && 
                       profile.occupation && 
                       profile.designation;

    res.json({ 
      completed: isCompleted, 
      profile,
      message: isCompleted ? 'Profile is complete' : 'Profile needs completion'
    });
  } catch (err) {
    console.error('Error checking profile completion:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get expert profiles only
exports.getExpertProfiles = async (req, res) => {
  try {
    const Role = require('../models/Role');
    
    // Find the expert role
    const expertRole = await Role.findOne({ name: 'expert' });
    
    if (!expertRole) {
      return res.status(404).json({ error: 'Expert role not found' });
    }

    // Find all profiles where the user has expert role
    const expertProfiles = await Profile.find()
      .populate({
        path: 'userId',
        match: { roleId: expertRole._id },
        select: 'name email phoneNo roleId'
      })
      .exec();

    // Filter out profiles where userId is null (non-expert users)
    const validExpertProfiles = expertProfiles.filter(profile => profile.userId !== null);

    res.json({ 
      profiles: validExpertProfiles,
      count: validExpertProfiles.length 
    });
  } catch (err) {
    console.error('Error fetching expert profiles:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

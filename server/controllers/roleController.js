const Role = require('../models/Role');

// Create a new role
exports.createRole = async (req, res) => {
  try {
    const { name, displayName, description } = req.body;

    const role = new Role({
      name,
      displayName,
      description
    });

    await role.save();
    res.status(201).json({ message: 'Role created successfully', role });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Role already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Get all roles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ name: 1 });
    res.json({ roles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get role by ID
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json({ role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get role by name
exports.getRoleByName = async (req, res) => {
  try {
    const role = await Role.findOne({ name: req.params.name.toLowerCase() });
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }
    res.json({ role });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update role
exports.updateRole = async (req, res) => {
  try {
    const { name, displayName, description } = req.body;
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { name, displayName, description },
      { new: true, runValidators: true }
    );

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.json({ message: 'Role updated successfully', role });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'Role name already exists' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete role
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;

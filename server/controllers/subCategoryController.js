const SubCategory = require('../models/SubCategory');

// Create a new subcategory
exports.createSubCategory = async (req, res) => {
  try {
    const { name, categoryId, description } = req.body;

    const subCategory = new SubCategory({
      name,
      categoryId,
      description
    });

    await subCategory.save();
    res.status(201).json({ message: 'SubCategory created successfully', subCategory });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'SubCategory already exists in this category' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Get all subcategories
exports.getAllSubCategories = async (req, res) => {
  try {
    const subCategories = await SubCategory.find()
      .populate('categoryId', 'name')
      .sort({ name: 1 });
    res.json({ subCategories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get subcategories by category ID
exports.getSubCategoriesByCategory = async (req, res) => {
  try {
    const subCategories = await SubCategory.find({ categoryId: req.params.categoryId })
      .sort({ name: 1 });
    res.json({ subCategories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get subcategory by ID
exports.getSubCategoryById = async (req, res) => {
  try {
    const subCategory = await SubCategory.findById(req.params.id)
      .populate('categoryId', 'name');
    if (!subCategory) {
      return res.status(404).json({ error: 'SubCategory not found' });
    }
    res.json({ subCategory });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update subcategory
exports.updateSubCategory = async (req, res) => {
  try {
    const { name, categoryId, description } = req.body;
    const subCategory = await SubCategory.findByIdAndUpdate(
      req.params.id,
      { name, categoryId, description },
      { new: true, runValidators: true }
    ).populate('categoryId', 'name');

    if (!subCategory) {
      return res.status(404).json({ error: 'SubCategory not found' });
    }

    res.json({ message: 'SubCategory updated successfully', subCategory });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ error: 'SubCategory name already exists in this category' });
    }
    res.status(500).json({ error: error.message });
  }
};

// Delete subcategory
exports.deleteSubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findByIdAndDelete(req.params.id);
    if (!subCategory) {
      return res.status(404).json({ error: 'SubCategory not found' });
    }

    res.json({ message: 'SubCategory deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = exports;

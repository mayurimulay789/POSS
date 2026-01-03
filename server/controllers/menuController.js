const MenuCategory = require('../models/MenuCategory');
const MenuItem = require('../models/MenuItem');
const { uploadBufferToCloudinary } = require('../utils/cloudinary');
const xlsx = require('xlsx');
const axios = require('axios');

const normalizeName = (value = '') => value.trim().replace(/\s+/g, ' ').toLowerCase();

// Find a category by normalized name (case/space-insensitive), parent, and merchant
const findCategoryByName = async (name, parentId, merchantId) => {
  const normalizedName = normalizeName(name);
  const filter = {
    normalizedName,
    parent: parentId || null
  };

  if (merchantId) {
    filter.merchant = merchantId;
  } else {
    filter.$or = [{ merchant: { $exists: false } }, { merchant: null }];
  }

  const found = await MenuCategory.findOne(filter);
  if (found) return found;

  // Fallback for legacy records that may not have normalizedName populated yet
  const legacyFilter = {
    name: { $regex: `^${(name || '').trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
    parent: parentId || null
  };
  if (merchantId) {
    legacyFilter.merchant = merchantId;
  } else {
    legacyFilter.$or = [{ merchant: { $exists: false } }, { merchant: null }];
  }

  const legacy = await MenuCategory.findOne(legacyFilter);
  if (legacy && !legacy.normalizedName) {
    legacy.normalizedName = normalizedName;
    try { await legacy.save(); } catch (e) { console.warn('Failed to backfill normalizedName for legacy category', e.message); }
  }
  return legacy;
};

// Create a category (optionally as a sub-category)
exports.createCategory = async (req, res) => {
  try {
    const { name, parent } = req.body;
    const merchant = req.user?._id || req.body.merchant; // try to get from auth middleware or body
    const normalizedName = normalizeName(name);
    const parentId = parent || null;

    if (!normalizedName) return res.status(400).json({ message: 'Category name required' });

    // Debug: show schema info for merchant path
    try {
      const merchantPath = MenuCategory.schema.path('merchant');
      console.log('MenuCategory.schema merchant options:', merchantPath && merchantPath.options);
    } catch (dbgErr) {
      console.log('Error reading MenuCategory.schema for debug:', dbgErr.message);
    }

    console.log('Creating category with payload:', { name: normalizedName, parent: parentId, merchant });

    const duplicate = await findCategoryByName(normalizedName, parentId, merchant);
    if (duplicate) {
      return res.status(409).json({ message: 'Category already exists at this level' });
    }

    const category = new MenuCategory({ name: (name || '').trim().replace(/\s+/g, ' '), normalizedName, parent: parentId, merchant });
    await category.save();
    res.json(category);
  } catch (err) {
    if (err && err.code === 11000) {
      return res.status(409).json({ message: 'Category already exists at this level' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get categories (with optional merchant filter)
exports.getCategories = async (req, res) => {
  try {
    const merchant = req.query.merchant || (req.user && req.user._id);
    const categories = await MenuCategory.find(merchant ? { merchant } : {}).lean();
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a category if it has no items or subcategories
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    const category = await MenuCategory.findById(id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    
    // Allow merchants who own it OR any manager to delete
    if (currentUser && category.merchant && category.merchant.toString() !== currentUser._id.toString()) {
      if (currentUser.role !== 'manager') {
        return res.status(403).json({ message: 'Not authorized to delete this category' });
      }
    }

    const itemCount = await MenuItem.countDocuments({ category: id });
    if (itemCount > 0) {
      return res.status(400).json({ message: 'Cannot delete: remove or reassign items first' });
    }

    const childCount = await MenuCategory.countDocuments({ parent: id });
    if (childCount > 0) {
      return res.status(400).json({ message: 'Cannot delete: remove subcategories first' });
    }

    await MenuCategory.deleteOne({ _id: id });
    return res.json({ message: 'Category deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create menu item (image upload supported)
exports.createItem = async (req, res) => {
  try {
    console.log('🟢 === CREATE ITEM CALLED ===');
    console.log('Request has file:', !!req.file);
    if (req.file) console.log('File details:', { fieldname: req.file.fieldname, originalname: req.file.originalname, size: req.file.size, bufferExists: !!req.file.buffer });
    
    const { name, description, price, category } = req.body;
    const merchant = req.user?._id || req.body.merchant;

    console.log('Create item payload:', { name, description, price, category, merchant, hasFile: !!req.file });

    if (!name || !price || !category) return res.status(400).json({ message: 'Missing fields' });

    let imageUrl = req.body.imageUrl || null;

    if (req.file && req.file.buffer) {
      const originalName = req.file.originalname || 'upload';
      const ext = (originalName.match(/\.[^/.]+$/) || ['.jpg'])[0];
      const filename = `${Date.now()}_${originalName.replace(/\.[^/.]+$/, '')}${ext}`;
      console.log('🔵 Starting Cloudinary upload for:', filename);
      try {
        const result = await uploadBufferToCloudinary(req.file.buffer, filename);
        imageUrl = result.secure_url;
        console.log('✅ Image URL set to:', imageUrl);
      } catch (uploadErr) {
        console.error('❌ Cloudinary upload failed:', uploadErr.message);
        return res.status(500).json({ 
          message: 'Failed to upload image to Cloudinary. Please check your Cloudinary configuration.',
          error: uploadErr.message 
        });
      }
    }

    const item = new MenuItem({ name, description, price: Number(price), category, imageUrl, merchant });
    try {
      await item.save();
    } catch (saveErr) {
      console.error('MenuItem save error:', saveErr && saveErr.message, saveErr.errors || 'no errors obj');
      return res.status(500).json({ message: 'Failed to save item', error: saveErr.message });
    }
    // emit quick event by returning success; front-end should refresh or listen to custom event
    res.json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get items optionally by category or merchant
exports.getItems = async (req, res) => {
  try {
    const { category, merchant } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (merchant) filter.merchant = merchant;

    const items = await MenuItem.find(filter).populate('category').lean();
    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update menu item
exports.updateItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const { name, description, price, category, available } = req.body;
    const merchant = req.user?._id || req.body.merchant;

    console.log('Update item payload:', { itemId, name, description, price, category, available, merchant, hasFile: !!req.file });

    const item = await MenuItem.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    
    // Allow merchants who own it OR any manager to update
    if (item.merchant && req.user && item.merchant.toString() !== req.user._id.toString()) {
      if (req.user.role !== 'manager') {
        return res.status(403).json({ message: 'Not authorized to update this item' });
      }
    }
    if (name) item.name = name;
    if (typeof description !== 'undefined') item.description = description;
    if (typeof price !== 'undefined') item.price = Number(price);
    if (typeof category !== 'undefined' && category) item.category = category;
    if (typeof available !== 'undefined') item.available = available === 'true' || available === true;
    if (merchant) item.merchant = merchant;

    if (req.file && req.file.buffer) {
      const originalName = req.file.originalname || 'upload';
      const ext = (originalName.match(/\.[^/.]+$/) || ['.jpg'])[0];
      const filename = `${Date.now()}_${originalName.replace(/\.[^/.]+$/, '')}${ext}`;
      console.log('🔵 Starting Cloudinary upload for update:', filename);
      try {
        const result = await uploadBufferToCloudinary(req.file.buffer, filename);
        item.imageUrl = result.secure_url;
        console.log('✅ Image URL updated to:', item.imageUrl);
      } catch (uploadErr) {
        console.error('❌ Cloudinary upload failed:', uploadErr.message);
        return res.status(500).json({ 
          message: 'Failed to upload image to Cloudinary. Please check your Cloudinary configuration.',
          error: uploadErr.message 
        });
      }
    }

    try {
      await item.save();
    } catch (saveErr) {
      console.error('MenuItem update save error:', saveErr && saveErr.message, saveErr.errors || 'no errors obj');
      return res.status(500).json({ message: 'Failed to update item', error: saveErr.message });
    }

    res.json(item);
  } catch (err) {
    console.error('updateItem error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete menu item
exports.deleteItem = async (req, res) => {
  try {
    const itemId = req.params.id;
    const item = await MenuItem.findById(itemId);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Allow merchants who own it OR any manager to delete
    if (item.merchant && req.user && item.merchant.toString() !== req.user._id.toString()) {
      if (req.user.role !== 'manager') {
        return res.status(403).json({ message: 'Not authorized to delete this item' });
      }
    }

    await MenuItem.deleteOne({ _id: itemId });
    res.json({ message: 'Item deleted' });
  } catch (err) {
    console.error('deleteItem error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload Excel file to create categories/items
exports.uploadExcel = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) return res.status(400).json({ message: 'No file uploaded' });

    const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    // Expect columns: Category, Subcategory (optional), ItemName, Description, Price, ImageUrl(optional), ImageBase64(optional)
    const merchant = req.user?._id || req.body.merchant;
    let uploadErrors = [];

    const findOrCreateCategory = async (catName, parentId = null) => {
      const displayName = (catName || '').toString().trim().replace(/\s+/g, ' ');
      const normalizedName = normalizeName(displayName);
      const existing = await findCategoryByName(normalizedName, parentId, merchant);
      if (existing) return existing;
      const newCat = new MenuCategory({ name: displayName, normalizedName, parent: parentId || null, merchant });
      return newCat.save();
    };


    // Helper to process a single row
    const processRow = async (row) => {
      const catName = (row.Category || 'Uncategorized').toString().trim();
      const subName = row.Subcategory ? row.Subcategory.toString().trim() : null;
      const itemName = row.ItemName ? row.ItemName.toString().trim() : null;
      const description = row.Description || '';
      const price = row.Price ? Number(row.Price) : 0;
      let imageUrl = row.ImageUrl || null;

      // Handle fetching and uploading images from URLs in ImageUrl column
      if (imageUrl && !imageUrl.startsWith('http://res.cloudinary.com') && !imageUrl.startsWith('https://res.cloudinary.com') && !imageUrl.startsWith('data:image')) {
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
          try {
            const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const buffer = Buffer.from(response.data);
            const ext = imageUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i)?.[1] || 'jpg';
            const filename = `excel_${Date.now()}_${itemName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${ext}`;
            try {
              const result = await uploadBufferToCloudinary(buffer, filename);
              imageUrl = result.secure_url;
            } catch (cloudinaryErr) {
              uploadErrors.push(`Image upload failed for ${itemName}: ${cloudinaryErr.message}`);
              imageUrl = null;
            }
          } catch (fetchErr) {
            uploadErrors.push(`Image fetch failed for ${itemName}: ${fetchErr.message}`);
            imageUrl = null;
          }
        } else {
          imageUrl = null;
        }
      }

      // Handle base64 encoded images from Excel
      if (row.ImageBase64 && !imageUrl) {
        try {
          const base64Data = row.ImageBase64.toString().trim();
          if (base64Data.startsWith('data:image')) {
            const base64String = base64Data.split(',')[1];
            const buffer = Buffer.from(base64String, 'base64');
            const ext = base64Data.match(/data:image\/([^;]+)/)?.[1] || 'jpg';
            const filename = `excel_${Date.now()}_${itemName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${ext}`;
            try {
              const result = await uploadBufferToCloudinary(buffer, filename);
              imageUrl = result.secure_url;
            } catch (cloudinaryErr) {
              uploadErrors.push(`Image upload failed for ${itemName}: ${cloudinaryErr.message}`);
            }
          } else if (/^[A-Za-z0-9+/=]+$/.test(base64Data)) {
            const buffer = Buffer.from(base64Data, 'base64');
            const filename = `excel_${Date.now()}_${itemName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.jpg`;
            try {
              const result = await uploadBufferToCloudinary(buffer, filename);
              imageUrl = result.secure_url;
            } catch (cloudinaryErr) {
              uploadErrors.push(`Image upload failed for ${itemName}: ${cloudinaryErr.message}`);
            }
          }
        } catch (err) {
          uploadErrors.push(`Image processing error for ${itemName}: ${err.message}`);
        }
      }

      // find or create category
      const parentCat = await findOrCreateCategory(catName, null);
      let finalCategory = parentCat;
      if (subName) {
        const subCat = await findOrCreateCategory(subName, parentCat._id);
        finalCategory = subCat;
      }

      if (itemName) {
        const item = new MenuItem({
          name: itemName,
          description,
          price,
          imageUrl,
          category: finalCategory._id,
          merchant
        });
        await item.save();
      }
    };

    // Batch process rows in parallel (limit concurrency)
    const BATCH_SIZE = 5;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const batch = rows.slice(i, i + BATCH_SIZE);
      await Promise.allSettled(batch.map(processRow));
    }

    const message = uploadErrors.length > 0 
      ? `Excel processed with ${uploadErrors.length} image upload error(s). Details: ${uploadErrors.join('; ')}`
      : 'Excel processed successfully';
    
    res.json({ message, errors: uploadErrors });
  } catch (err) {
    console.error('Excel upload error', err);
    res.status(500).json({ message: 'Server error parsing Excel' });
  }
};

const Table = require('../models/Table');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');

// Get all tables for the logged-in user
exports.getTables = async (req, res) => {
  try {
    const { spaceType } = req.query;
    const filter = { createdBy: req.user.id };
    
    if (spaceType) {
      filter.spaceType = spaceType;
    }

    const tables = await Table.find(filter).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: tables.length,
      data: tables
    });
  } catch (error) {
    console.error('Error fetching tables:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching tables',
      error: error.message
    });
  }
};

// Create a new table
exports.createTable = async (req, res) => {
  try {
    const { tableName, capacity, spaceType } = req.body;

    // Validate required fields
    if (!tableName || !capacity || !spaceType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide tableName, capacity, and spaceType'
      });
    }

    // Handle image upload if provided
    let tableImage = 'https://res.cloudinary.com/demo/image/upload/v1/table-placeholder.png';
    
    if (req.file) {
      try {
        const result = await uploadToCloudinary(req.file.buffer, 'tables');
        tableImage = result.secure_url;
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        // Continue with default image if upload fails
      }
    }

    const table = await Table.create({
      tableName,
      capacity,
      spaceType,
      tableImage,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Table created successfully',
      data: table
    });
  } catch (error) {
    console.error('Error creating table:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating table',
      error: error.message
    });
  }
};

// Update a table
exports.updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const { tableName, capacity, status, spaceType, orderedMenu, totalBill } = req.body;

    // Find table and verify ownership
    let table = await Table.findOne({ _id: id, createdBy: req.user.id });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found or you do not have permission to update it'
      });
    }

    // Handle image upload if provided
    if (req.file) {
      try {
        // Delete old image from Cloudinary if it's not the default placeholder
        if (table.tableImage && !table.tableImage.includes('table-placeholder')) {
          const publicId = table.tableImage.split('/').pop().split('.')[0];
          await deleteFromCloudinary(`tables/${publicId}`);
        }

        // Upload new image
        const result = await uploadToCloudinary(req.file.buffer, 'tables');
        table.tableImage = result.secure_url;
      } catch (uploadError) {
        console.error('Error uploading image:', uploadError);
        // Continue with update even if image upload fails
      }
    }

    // Update fields
    if (tableName) table.tableName = tableName;
    if (capacity) table.capacity = capacity;
    if (status) table.status = status;
    if (spaceType) table.spaceType = spaceType;
    if (orderedMenu !== undefined) table.orderedMenu = orderedMenu;
    if (totalBill !== undefined) table.totalBill = totalBill;

    await table.save();

    res.status(200).json({
      success: true,
      message: 'Table updated successfully',
      data: table
    });
  } catch (error) {
    console.error('Error updating table:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating table',
      error: error.message
    });
  }
};

// Delete a table
exports.deleteTable = async (req, res) => {
  try {
    const { id } = req.params;

    // Find table and verify ownership
    const table = await Table.findOne({ _id: id, createdBy: req.user.id });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found or you do not have permission to delete it'
      });
    }

    // Delete image from Cloudinary if it's not the default placeholder
    if (table.tableImage && !table.tableImage.includes('table-placeholder')) {
      try {
        const publicId = table.tableImage.split('/').pop().split('.')[0];
        await deleteFromCloudinary(`tables/${publicId}`);
      } catch (deleteError) {
        console.error('Error deleting image from Cloudinary:', deleteError);
        // Continue with deletion even if image deletion fails
      }
    }

    await Table.deleteOne({ _id: id });

    res.status(200).json({
      success: true,
      message: 'Table deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting table:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting table',
      error: error.message
    });
  }
};

// Get a single table by ID
exports.getTableById = async (req, res) => {
  try {
    const { id } = req.params;

    const table = await Table.findOne({ _id: id, createdBy: req.user.id });

    if (!table) {
      return res.status(404).json({
        success: false,
        message: 'Table not found'
      });
    }

    res.status(200).json({
      success: true,
      data: table
    });
  } catch (error) {
    console.error('Error fetching table:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching table',
      error: error.message
    });
  }
};

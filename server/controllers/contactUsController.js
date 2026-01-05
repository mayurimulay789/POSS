const ContactUs = require('../models/ContactUs');

// @desc    Get all contact information
// @route   GET /api/contact-us/all
// @access  Private/Merchant
const getAllContactUs = async (req, res) => {
  try {
    const contacts = await ContactUs.find()
      .populate('lastUpdatedBy', 'FullName email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: contacts.length,
      data: contacts
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contacts',
      error: error.message
    });
  }
};

// @desc    Get active contact info
// @route   GET /api/contact-us
// @access  Public
const getContactUs = async (req, res) => {
  try {
    const contact = await ContactUs.findOne({ isActive: true })
      .populate('lastUpdatedBy', 'FullName email');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact information not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Error fetching contact info:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact information',
      error: error.message
    });
  }
};

// @desc    Get single contact by ID
// @route   GET /api/contact-us/:id
// @access  Private/Merchant
const getContactUsById = async (req, res) => {
  try {
    const contact = await ContactUs.findById(req.params.id)
      .populate('lastUpdatedBy', 'FullName email');

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact information not found'
      });
    }

    res.status(200).json({
      success: true,
      data: contact
    });
  } catch (error) {
    console.error('Error fetching contact info:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching contact information',
      error: error.message
    });
  }
};

// @desc    Create contact info
// @route   POST /api/contact-us
// @access  Private/Merchant
const createContactUs = async (req, res) => {
  try {
    const { email, contactNo, address, googleMapLocation } = req.body;

    if (!email || !contactNo || !address) {
      return res.status(400).json({
        success: false,
        message: 'Email, contact number, and address are required'
      });
    }

    const contact = await ContactUs.create({
      email,
      contactNo,
      address,
      googleMapLocation: googleMapLocation || '',
      isActive: false,
      lastUpdatedBy: req.user._id
    });

    await contact.populate('lastUpdatedBy', 'FullName email');

    res.status(201).json({
      success: true,
      message: 'Contact information created successfully',
      data: contact
    });
  } catch (error) {
    console.error('Error creating contact info:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating contact information',
      error: error.message
    });
  }
};

// @desc    Update contact info
// @route   PUT /api/contact-us/:id
// @access  Private/Merchant
const updateContactUs = async (req, res) => {
  try {
    const { email, contactNo, address, googleMapLocation, isActive } = req.body;

    let contact = await ContactUs.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact information not found'
      });
    }

    // Update fields
    contact.email = email || contact.email;
    contact.contactNo = contactNo || contact.contactNo;
    contact.address = address || contact.address;
    contact.googleMapLocation = googleMapLocation !== undefined ? googleMapLocation : contact.googleMapLocation;
    contact.lastUpdatedBy = req.user._id;

    if (isActive !== undefined) {
      // If activating this contact, deactivate all others first
      if (isActive === true) {
        await ContactUs.updateMany(
          { _id: { $ne: req.params.id } },
          { $set: { isActive: false } }
        );
      }
      contact.isActive = isActive;
    }

    await contact.save();
    await contact.populate('lastUpdatedBy', 'FullName email');

    res.status(200).json({
      success: true,
      message: 'Contact information updated successfully',
      data: contact
    });
  } catch (error) {
    console.error('Error updating contact info:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating contact information',
      error: error.message
    });
  }
};

// @desc    Delete contact info
// @route   DELETE /api/contact-us/:id
// @access  Private/Merchant
const deleteContactUs = async (req, res) => {
  try {
    const contact = await ContactUs.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact information not found'
      });
    }

    await contact.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Contact information deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting contact info:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting contact information',
      error: error.message
    });
  }
};

// @desc    Toggle contact info active status
// @route   PATCH /api/contact-us/:id/toggle
// @access  Private/Merchant
const toggleContactUsStatus = async (req, res) => {
  try {
    const contact = await ContactUs.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Contact information not found'
      });
    }

    const newStatus = !contact.isActive;

    // If activating this contact, deactivate all others first
    if (newStatus === true) {
      await ContactUs.updateMany(
        { _id: { $ne: req.params.id } },
        { $set: { isActive: false } }
      );
    }

    contact.isActive = newStatus;
    contact.lastUpdatedBy = req.user._id;
    await contact.save();
    await contact.populate('lastUpdatedBy', 'FullName email');

    res.status(200).json({
      success: true,
      message: `Contact information ${contact.isActive ? 'activated' : 'deactivated'} successfully`,
      data: contact
    });
  } catch (error) {
    console.error('Error toggling contact status:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling contact status',
      error: error.message
    });
  }
};

module.exports = {
  getAllContactUs,
  getContactUs,
  getContactUsById,
  createContactUs,
  updateContactUs,
  deleteContactUs,
  toggleContactUsStatus
};

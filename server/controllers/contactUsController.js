const ContactUs = require('../models/ContactUs');

// @desc    Get active contact info
// @route   GET /api/contact-us
// @access  Public
const getContactUs = async (req, res) => {
  try {
    const contact = await ContactUs.findOne({ isActive: true });

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

// @desc    Create/Update contact info
// @route   POST /api/contact-us
// @access  Private/Merchant
const createOrUpdateContactUs = async (req, res) => {
  try {
    const { email, contactNo, address, googleMapLocation } = req.body;

    if (!email || !contactNo || !address) {
      return res.status(400).json({
        success: false,
        message: 'Email, contact number, and address are required'
      });
    }

    // Find existing active contact
    const existingContact = await ContactUs.findOne({ isActive: true });

    if (existingContact) {
      // Update existing
      existingContact.email = email;
      existingContact.contactNo = contactNo;
      existingContact.address = address;
      existingContact.googleMapLocation = googleMapLocation || '';
      existingContact.lastUpdatedBy = req.user._id;
      await existingContact.save();

      return res.status(200).json({
        success: true,
        message: 'Contact information updated successfully',
        data: existingContact
      });
    } else {
      // Create new
      const contact = await ContactUs.create({
        email,
        contactNo,
        address,
        googleMapLocation: googleMapLocation || '',
        isActive: true,
        lastUpdatedBy: req.user._id
      });

      return res.status(201).json({
        success: true,
        message: 'Contact information created successfully',
        data: contact
      });
    }
  } catch (error) {
    console.error('Error saving contact info:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving contact information',
      error: error.message
    });
  }
};

module.exports = {
  getContactUs,
  createOrUpdateContactUs
};

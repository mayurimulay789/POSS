const mongoose = require('mongoose');

const cuisineGallerySchema = new mongoose.Schema(
  {
    heading: {
      type: String,
      required: [true, 'Please provide a heading for cuisine gallery'],
      trim: true,
      maxlength: [100, 'Heading cannot be more than 100 characters']
    },
    subheading: {
      type: String,
      trim: true,
      maxlength: [200, 'Subheading cannot be more than 200 characters']
    },
    isActive: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to ensure only one active record
cuisineGallerySchema.pre('save', async function() {
  // Only enforce single active if this document is being set to active
  if (this.isModified('isActive') && this.isActive === true) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id }, isActive: true },
      { $set: { isActive: false } }
    );
  }
});

module.exports = mongoose.model('CuisineGallery', cuisineGallerySchema);

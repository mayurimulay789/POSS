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
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters']
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to ensure only one active record
cuisineGallerySchema.pre('save', async function(next) {
  if (this.isActive) {
    await mongoose.model('CuisineGallery').updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
});

module.exports = mongoose.model('CuisineGallery', cuisineGallerySchema);

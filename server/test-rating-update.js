require('dotenv').config();
const mongoose = require('mongoose');
const Review = require('./models/Review');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI;

async function updateAllExpertRatings() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all unique expert IDs from reviews
    const expertIds = await Review.distinct('expertId');
    console.log(`📊 Found ${expertIds.length} experts with reviews`);

    for (const expertId of expertIds) {
      // Calculate stats for this expert
      const stats = await Review.aggregate([
        { $match: { expertId: new mongoose.Types.ObjectId(expertId) } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$overallRating' },
            totalReviews: { $sum: 1 }
          }
        }
      ]);

      if (stats.length > 0) {
        const updatedUser = await User.findByIdAndUpdate(
          expertId,
          {
            averageRating: parseFloat(stats[0].averageRating.toFixed(2)),
            totalReviews: stats[0].totalReviews
          },
          { new: true }
        );

        console.log(`✅ Updated ${updatedUser.name}:`, {
          averageRating: updatedUser.averageRating,
          totalReviews: updatedUser.totalReviews
        });
      }
    }

    console.log('\n✅ All expert ratings updated successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

updateAllExpertRatings();

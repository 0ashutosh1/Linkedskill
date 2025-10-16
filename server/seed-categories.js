require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('./models/Category');
const SubCategory = require('./models/SubCategory');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/coursue-dev';

const seedData = [
  {
    category: 'Frontend Development',
    description: 'Build modern and interactive user interfaces',
    subcategories: [
      { name: 'React', description: 'React.js library and ecosystem' },
      { name: 'Vue', description: 'Vue.js framework' },
      { name: 'Angular', description: 'Angular framework' },
      { name: 'HTML/CSS', description: 'Web fundamentals' },
      { name: 'JavaScript', description: 'Core JavaScript programming' }
    ]
  },
  {
    category: 'Backend Development',
    description: 'Server-side programming and APIs',
    subcategories: [
      { name: 'Node.js', description: 'JavaScript runtime for backend' },
      { name: 'Python', description: 'Python programming for backend' },
      { name: 'Java', description: 'Java enterprise development' },
      { name: 'PHP', description: 'PHP web development' },
      { name: 'Database', description: 'Database design and management' }
    ]
  },
  {
    category: 'Design',
    description: 'User experience and visual design',
    subcategories: [
      { name: 'UI Design', description: 'User Interface design principles' },
      { name: 'UX Design', description: 'User Experience design' },
      { name: 'Graphic Design', description: 'Visual communication design' },
      { name: 'Figma', description: 'Figma design tool' },
      { name: 'Adobe XD', description: 'Adobe XD design tool' }
    ]
  },
  {
    category: 'Data Science',
    description: 'Data analysis and machine learning',
    subcategories: [
      { name: 'Machine Learning', description: 'ML algorithms and models' },
      { name: 'Data Analysis', description: 'Analyzing and interpreting data' },
      { name: 'Python', description: 'Python for data science' },
      { name: 'R', description: 'R programming for statistics' },
      { name: 'Statistics', description: 'Statistical methods and analysis' }
    ]
  },
  {
    category: 'Mobile Development',
    description: 'iOS and Android app development',
    subcategories: [
      { name: 'React Native', description: 'Cross-platform mobile with React' },
      { name: 'Flutter', description: 'Cross-platform mobile with Dart' },
      { name: 'iOS', description: 'Native iOS development' },
      { name: 'Android', description: 'Native Android development' },
      { name: 'Kotlin', description: 'Kotlin for Android' }
    ]
  }
];

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('✓ Connected to MongoDB');

    // Clear existing data
    console.log('\nClearing existing categories and subcategories...');
    await SubCategory.deleteMany({});
    await Category.deleteMany({});
    console.log('✓ Cleared existing data');

    console.log('\nSeeding categories and subcategories...');
    
    for (const item of seedData) {
      // Create category
      const category = new Category({
        name: item.category,
        description: item.description
      });
      await category.save();
      console.log(`✓ Created category: ${item.category}`);

      // Create subcategories
      for (const sub of item.subcategories) {
        const subCategory = new SubCategory({
          name: sub.name,
          categoryId: category._id,
          description: sub.description
        });
        await subCategory.save();
        console.log(`  ✓ Created subcategory: ${sub.name}`);
      }
    }

    console.log('\n✅ Database seeded successfully!');
    console.log(`   Categories: ${seedData.length}`);
    console.log(`   Subcategories: ${seedData.reduce((sum, item) => sum + item.subcategories.length, 0)}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  }
}

seedDatabase();

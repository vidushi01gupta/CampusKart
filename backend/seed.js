import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import Listing from './models/Listing.js';
import User from './models/User.js';

const seedEmail = 'demo-seller@campuskart.local';
const defaultImage = '/assets/default-listing.jpg';
const image = (photoId) => `https://images.unsplash.com/${photoId}?auto=format&fit=crop&w=900&q=85`;

const productImages = {
  'Engineering Mathematics Textbook': image('photo-1544947950-fa07a98d237f'),
  'Operating Systems Concepts': image('photo-1512820790803-83ca734da794'),
  'Organic Chemistry Guide': image('photo-1532012197267-da84d127e765'),
  'Data Structures Notes Bundle': image('photo-1456324504439-367cee3b3c32'),
  'Calculus Exam Notes': image('photo-1495446815901-a7297e633e8d'),
  'MacBook Air M1': image('photo-1496181133206-80ce9b88a853'),
  'Casio FX-991ES Plus Calculator': image('photo-1587145820266-a5951ee6f620'),
  'Noise Cancelling Headphones': image('photo-1505740420928-5e560c06d30e'),
  'USB-C Mechanical Keyboard': image('photo-1587825140708-dfaf72ae4b04'),
  'Wireless Bluetooth Speaker': image('photo-1608043152269-423dbba4e7e1'),
  'Firefox Hybrid Bicycle': image('photo-1485965120184-e220f721d03e'),
  'Single Speed City Bicycle': image('photo-1502744688674-c619d1586c9e'),
  'Bicycle U-Lock and Light Set': image('photo-1558981806-ec527fa84c39'),
  'Study Desk with Drawer': image('photo-1518455027359-f3f8164ba6bd'),
  'Ergonomic Study Chair': image('photo-1580480055273-228ff5388ef8'),
  'Wooden Bookshelf': image('photo-1594620302200-9a762244a156'),
  'LED Desk Lamp': image('photo-1507473885765-e6ed057f782c'),
  'Mini Bean Bag Chair': image('photo-1586023492125-27b2c045efd7'),
  'Oversized Campus Hoodie': image('photo-1556821840-3a63f95609a7'),
  'Denim Jacket': image('photo-1543076447-215ad9ba6923'),
  'Formal Shirt and Trousers Set': image('photo-1594938298603-c8148c4dae35'),
  'Running Shoes - Size 9': image('photo-1542291026-7eec264c27ff'),
  'Badminton Racket Pair': image('photo-1626224583764-f87db24ac4ea'),
  'Yoga Mat': image('photo-1544367567-0f2fcb009e0b'),
  Football: image('photo-1579952363873-27f3bade9f55'),
  'Acoustic Guitar': image('photo-1525201548942-d8732f6617a0'),
  'Guitar Stand and Tuner': image('photo-1550291652-6ea9114a47b1'),
  'MIDI Keyboard Controller': image('photo-1598488035139-bdbb2231ce04'),
  'Harmonica Set': image('photo-1524650359799-842906ca1c06'),
  'Hostel Essentials Starter Kit': image('photo-1555041469-a586c61ea9bc'),
  'Linear Algebra Made Easy': image('photo-1497633762265-9d179a990aa6'),
  'Introduction to Psychology': image('photo-1544717305-2782549b5136'),
  'Portable SSD 512GB': image('photo-1597872200969-2b65d56bd16b'),
  'Smartwatch Fitness Tracker': image('photo-1523275335684-37898b6baf30'),
  'Bicycle Repair Toolkit': image('photo-1581235720704-06d3acfcb36f'),
  'Foldable Laptop Table': image('photo-1494438639946-1ebd1d20bf85'),
  'Cotton College T-Shirts': image('photo-1521572163474-6864f9cf17ab'),
  'Table Tennis Paddle Set': image('photo-1534158914592-062992fbe900'),
  'Ukulele with Carrying Case': image('photo-1556449895-a33c9dba33dd'),
  'Thermodynamics Revision Notes': image('photo-1501351378407-2d3a9b5f9a05'),
};

const products = [
  ['Engineering Mathematics Textbook', 'Books', 450, 'Like New', 'Library Road'],
  ['Operating Systems Concepts', 'Books', 550, 'Good', 'Hostel Block A'],
  ['Organic Chemistry Guide', 'Books', 300, 'Like New', 'Science Block'],
  ['Data Structures Notes Bundle', 'Notes', 180, 'New', 'Academic Block'],
  ['Calculus Exam Notes', 'Notes', 120, 'Good', 'Library Road'],
  ['MacBook Air M1', 'Electronics', 52000, 'Like New', 'Hostel Block B'],
  ['Casio FX-991ES Plus Calculator', 'Electronics', 900, 'Good', 'Engineering Block'],
  ['Noise Cancelling Headphones', 'Electronics', 2200, 'Like New', 'Hostel Block C'],
  ['USB-C Mechanical Keyboard', 'Electronics', 1800, 'New', 'Computer Lab'],
  ['Wireless Bluetooth Speaker', 'Electronics', 1200, 'Good', 'Student Centre'],
  ['Firefox Hybrid Bicycle', 'Bikes', 8500, 'Good', 'Main Gate'],
  ['Single Speed City Bicycle', 'Bikes', 4500, 'Fair', 'Hostel Block A'],
  ['Bicycle U-Lock and Light Set', 'Bikes', 700, 'New', 'Sports Complex'],
  ['Study Desk with Drawer', 'Furniture', 3200, 'Good', 'Hostel Block B'],
  ['Ergonomic Study Chair', 'Furniture', 2800, 'Like New', 'Hostel Block C'],
  ['Wooden Bookshelf', 'Furniture', 1600, 'Good', 'Hostel Block A'],
  ['LED Desk Lamp', 'Furniture', 650, 'New', 'Academic Block'],
  ['Mini Bean Bag Chair', 'Furniture', 1400, 'Good', 'Hostel Block D'],
  ['Oversized Campus Hoodie', 'Clothing', 800, 'Like New', 'Student Centre'],
  ['Denim Jacket', 'Clothing', 1100, 'Good', 'Hostel Block C'],
  ['Formal Shirt and Trousers Set', 'Clothing', 900, 'Like New', 'Hostel Block B'],
  ['Running Shoes - Size 9', 'Sports', 1500, 'Good', 'Sports Complex'],
  ['Badminton Racket Pair', 'Sports', 1100, 'Like New', 'Sports Complex'],
  ['Yoga Mat', 'Sports', 500, 'New', 'Hostel Block D'],
  ['Football', 'Sports', 750, 'Good', 'Main Ground'],
  ['Acoustic Guitar', 'Music', 4200, 'Good', 'Music Room'],
  ['Guitar Stand and Tuner', 'Music', 850, 'Like New', 'Student Centre'],
  ['MIDI Keyboard Controller', 'Music', 3500, 'Good', 'Arts Block'],
  ['Harmonica Set', 'Music', 600, 'New', 'Music Room'],
  ['Hostel Essentials Starter Kit', 'Furniture', 1000, 'Like New', 'Hostel Block A'],
  ['Linear Algebra Made Easy', 'Books', 350, 'Good', 'Library Road'],
  ['Introduction to Psychology', 'Books', 400, 'Like New', 'Arts Block'],
  ['Portable SSD 512GB', 'Electronics', 3600, 'Like New', 'Computer Lab'],
  ['Smartwatch Fitness Tracker', 'Electronics', 1800, 'Good', 'Hostel Block D'],
  ['Bicycle Repair Toolkit', 'Bikes', 950, 'New', 'Main Gate'],
  ['Foldable Laptop Table', 'Furniture', 1200, 'Good', 'Hostel Block B'],
  ['Cotton College T-Shirts', 'Clothing', 600, 'New', 'Student Centre'],
  ['Table Tennis Paddle Set', 'Sports', 900, 'Like New', 'Sports Complex'],
  ['Ukulele with Carrying Case', 'Music', 2400, 'Good', 'Music Room'],
  ['Thermodynamics Revision Notes', 'Notes', 220, 'Like New', 'Engineering Block'],
];

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/campus-bazaar');

  let seller = await User.findOne({ email: seedEmail });
  if (!seller) {
    seller = await User.create({
      name: 'CampusKart Demo Seller',
      email: seedEmail,
      password: await bcrypt.hash('campuskart-demo', 10),
      avatarBg: '#4f46e5',
      isVerified: true,
    });
  }

  await Listing.deleteMany({ seller: seller._id });

  const listings = products.map(([title, category, price, condition, location], index) => ({
    title,
    description: `Student listing for ${title.toLowerCase()}. Available for pickup on campus.`,
    price,
    originalPrice: Math.round(price * 1.2),
    category,
    condition,
    location,
    image: productImages[title] || defaultImage,
    images: [productImages[title] || defaultImage],
    tag: index < 3 ? 'Popular' : null,
    tagColor: index < 3 ? 'bg-primary/10 text-primary' : null,
    seller: seller._id,
    sellerName: seller.name,
    sellerAvatarBg: seller.avatarBg,
    sellerVerified: true,
    sellerRating: '4.9',
    rating: '4.8',
    reviews: (index % 6) + 1,
    active: true,
    isActive: true,
  }));

  await Listing.insertMany(listings);
  console.log(`Seeded ${listings.length} listings for ${seedEmail}`);
};

seed()
  .catch((error) => {
    console.error('Failed to seed listings:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });

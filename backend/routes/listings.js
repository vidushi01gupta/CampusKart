import express from 'express';
import Listing from '../models/Listing.js';
import { protect } from '../middleware/auth.js';
import User from '../models/User.js';

const router = express.Router();

const moderateListing = async (product) => {
  const response = await fetch(
    'http://localhost:5001/api/ai/moderate-listing',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: product.title,
        category: product.category,
        condition: product.condition,
        description: product.description,
      }),
      signal: AbortSignal.timeout(125000),
    }
  );

  if (!response.ok) {
    throw new Error(`Moderation service returned ${response.status}`);
  }

  const result = await response.json();

  if (
    !['approved', 'review', 'blocked'].includes(result.decision) ||
    !Array.isArray(result.reasons) ||
    !result.reasons.every((reason) => typeof reason === 'string')
  ) {
    throw new Error('Invalid moderation response.');
  }

  return result;
};


const mapListing = (listing) => {
  return {
    id: listing._id.toString(),
    sellerId: listing.seller ? listing.seller.toString() : null,
    title: listing.title,
    price: Number(listing.price || 0),
    originalPrice: Number(listing.originalPrice || listing.price || 0),
    category: listing.category,
    condition: listing.condition,
    location: listing.location,
    image: listing.image || listing.images?.[0] || '/assets/default-listing.jpg',
    tag: listing.tag ?? null,
    tagColor: listing.tagColor ?? null,
    createdAt: listing.createdAt,
    seller: listing.sellerName || 'Campus User',
    sellerAvatar: listing.sellerAvatar || '',
    sellerAvatarBg: listing.sellerAvatarBg || '#4f46e5',
    sellerVerified: listing.sellerVerified ?? true,
    sellerRating: listing.sellerRating || '4.8',
    sellerSales: 0,
    rating: listing.rating || '4.8',
    reviews: Number(listing.reviews || 0),
    reviewCount: Number(listing.reviews || 0),
    saved: !!listing.saved,
    description: listing.description,
    images: listing.images || [listing.image || '/assets/default-listing.jpg'],
    related: [],
    postedAt: listing.createdAt,
  };
};

router.get('/', async (req, res) => {
  try {
    const { category, search, condition, minPrice, maxPrice, sort = 'newest' } = req.query;
    const query = { active: true };

    if (category && category !== 'All') query.category = String(category);
    if (condition) query.condition = String(condition);
    if (search) query.title = { $regex: String(search), $options: 'i' };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const sortMap = {
      newest: { createdAt: -1 },
      price_asc: { price: 1 },
      price_desc: { price: -1 },
    };

    const limit = 50;
    const listings = await Listing.find(query).sort(sortMap[sort] || sortMap.newest).limit(limit).lean();
    res.json({ listings: listings.map(mapListing), total: listings.length, page: 1, limit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).lean();
    if (!listing) return res.status(404).json({ message: 'Listing not found' });
    return res.json(mapListing(listing));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});


router.post('/', async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      originalPrice,
      category,
      condition,
      location,
    } = req.body ?? {};

    // Validate required listing fields before calling the AI.
    if (
      typeof title !== 'string' ||
      !title.trim() ||
      title.trim().length > 150
    ) {
      return res.status(400).json({
        message: 'Enter a valid product title (maximum 150 characters).',
      });
    }

    if (
      typeof description !== 'string' ||
      !description.trim() ||
      description.length > 3000
    ) {
      return res.status(400).json({
        message: 'Enter a valid product description (maximum 3000 characters).',
      });
    }

    if (
      price === undefined ||
      price === null ||
      price === '' ||
      !Number.isFinite(Number(price)) ||
      Number(price) <= 0
    ) {
      return res.status(400).json({
        message: 'Enter a valid selling price.',
      });
    }

    if (
      typeof category !== 'string' ||
      !category.trim() ||
      typeof condition !== 'string' ||
      !condition.trim() ||
      typeof location !== 'string' ||
      !location.trim()
    ) {
      return res.status(400).json({
        message: 'Category, condition, and location are required.',
      });
    }

    // Ask the AI to check the listing before saving it.
    let moderation;

    try {
      moderation = await moderateListing({
        title: title.trim(),
        description: description.trim(),
        category,
        condition,
      });
    } catch (error) {
      console.error('Listing moderation failed:', error.message);

      return res.status(503).json({
        message:
          'Listing moderation is temporarily unavailable. Please try again.',
      });
    }

    // Do not save listings that the AI flags as clearly prohibited.
    if (moderation.decision === 'blocked') {
      return res.status(422).json({
        message: 'This listing could not be published.',
        moderationStatus: 'blocked',
        reasons: moderation.reasons,
      });
    }

    const needsReview = moderation.decision === 'review';

    
const sellerEmail = String(req.body.sellerEmail || '')
  .trim()
  .toLowerCase();

let sellerId = req.user?.id || req.user?._id;

if (!sellerId && sellerEmail) {
  const user = await User.findOne({ email: sellerEmail }).select('_id');

  if (!user) {
    return res.status(404).json({
      message: 'User account not found. Please sign in again.',
    });
  }

  sellerId = user._id;
}

if (!sellerId) {
  return res.status(401).json({
    message: 'Please sign in before posting a listing.',
  });
}


    const listing = await Listing.create({
      ...req.body,

      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      originalPrice:
        originalPrice !== undefined &&
        originalPrice !== null &&
        originalPrice !== ''
          ? Number(originalPrice)
          : Number(price),

      image: req.body.image || '/assets/default-listing.jpg',
      images:
        req.body.images ||
        [req.body.image || '/assets/default-listing.jpg'],

      seller: sellerId,

      sellerName: req.body.sellerName || 'Campus User',
      sellerAvatar: req.body.sellerAvatar || '',
      sellerAvatarBg: req.body.sellerAvatarBg || '#4f46e5',
      sellerVerified: req.body.sellerVerified ?? true,
      sellerRating: req.body.sellerRating || '4.8',
      rating: req.body.rating || '4.8',
      reviews: Number(req.body.reviews || 0),
      saved: !!req.body.saved,

      // Listings requiring review are hidden from public browsing.
      active: !needsReview,
      isActive: !needsReview,

      moderationStatus: needsReview ? 'review' : 'approved',
      moderationReasons: moderation.reasons,
      moderationCheckedAt: new Date(),
    });

    if (needsReview) {
      return res.status(202).json({
        message: 'Your listing has been submitted for manual review.',
        moderationStatus: 'review',
        reasons: moderation.reasons,
        listingId: listing._id,
      });
    }

    return res.status(201).json({
      ...mapListing(listing),
      moderationStatus: 'approved',
    });
  } catch (error) {
    console.error('Listing creation error:', error.message);
    return res.status(500).json({
      message: 'Failed to create listing.',
    });
  }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        message: 'Invalid listing ID.',
      });
    }

    const listing = await Listing.findById(id);

    if (!listing) {
      return res.status(404).json({
        message: 'Listing not found.',
      });
    }

    // The authenticated user must own the listing.
    if (listing.seller.toString() !== req.user.id.toString()) {
      return res.status(403).json({
        message: 'You can only delete your own listings.',
      });
    }

    await listing.deleteOne();

    return res.json({
      success: true,
      message: 'Listing deleted successfully.',
    });
  } catch (error) {
    console.error('Delete listing error:', error.message);

    return res.status(500).json({
      message: 'Failed to delete listing.',
    });
  }
});


router.post('/:id/save', async (req, res) => {
  try {
    return res.json({ saved: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get('/:id/reviews', async (req, res) => {
  return res.json([]);
});

router.post('/:id/reviews', async (req, res) => {
  const { rating = 5, text = '' } = req.body || {};
  return res.status(201).json({
    id: Date.now(),
    rating: Number(rating),
    text,
    createdAt: new Date().toISOString(),
    reviewerName: 'Campus User',
    reviewerAvatar: '',
    reviewerAvatarBg: '#4f46e5',
  });
});

router.post('/:id/sold', async (req, res) => {
  try {
    const { sellerUserId } = req.body || {};
    return res.json({ success: true, pointsAwarded: 10, sellerUserId });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;

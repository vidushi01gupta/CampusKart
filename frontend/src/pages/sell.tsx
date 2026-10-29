import { useState, useRef } from 'react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { motion } from 'motion/react';
import { useForm } from 'react-hook-form';
import {
  Upload, X, Camera, Tag, IndianRupee, MapPin,
  BookOpen, Laptop, Bike, Sofa, Shirt, Music, FileText,
  Dumbbell, CheckCircle, ArrowRight, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { postListing, type ApiListing } from '@/lib/api';
import { authClient } from '@/lib/auth/auth-client';

type ModerationStatus = 'approved' | 'review';

type FormData = {
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  category: string;
  condition: string;
  location: string;
};

const CATEGORIES = [
  { label: 'Books', icon: BookOpen, color: 'from-orange-400 to-amber-500' },
  { label: 'Electronics', icon: Laptop, color: 'from-blue-500 to-indigo-600' },
  { label: 'Bikes', icon: Bike, color: 'from-green-400 to-emerald-500' },
  { label: 'Furniture', icon: Sofa, color: 'from-purple-400 to-violet-500' },
  { label: 'Clothing', icon: Shirt, color: 'from-pink-400 to-rose-500' },
  { label: 'Music', icon: Music, color: 'from-cyan-400 to-sky-500' },
  { label: 'Notes', icon: FileText, color: 'from-yellow-400 to-orange-400' },
  { label: 'Sports', icon: Dumbbell, color: 'from-red-400 to-rose-600' },
];

const CONDITIONS = ['Like New', 'Good', 'Fair', 'Poor'];

export default function SellPage() {
  const { data: session } = authClient.useSession();
  const [images, setImages] = useState<string[]>([]); // base64 previews
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [newListing, setNewListing] = useState<ApiListing | null>(null);
  const [moderationStatus, setModerationStatus] = useState<ModerationStatus>('approved');

  const [moderationReasons, setModerationReasons] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, formState: { errors }, watch ,setValue} = useForm<FormData>();
  const titleValue = watch('title', '');
  const [suggestingPrice, setSuggestingPrice] = useState(false);
  const generateDescription = async () => {
  const title = watch('title', '').trim();

  if (!title) {
    toast.error('Please enter the item title first.');
    return;
  }

  if (!selectedCategory) {
    toast.error('Please select a category first.');
    return;
  }

  if (!selectedCondition) {
    toast.error('Please select the item condition first.');
    return;
  }

  setGeneratingDescription(true);

  try {
    const originalPriceValue = watch('originalPrice');

    const response = await fetch(
      'http://localhost:5001/api/ai/generate-description',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: title,
          category: selectedCategory,
          condition: selectedCondition,
          ...(originalPriceValue
            ? { originalPrice: Number(originalPriceValue) }
            : {}),
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error || 'Failed to generate description.'
      );
    }

    if (!result.description) {
      throw new Error('No description was returned.');
    }

    setValue('description', result.description, {
      shouldValidate: true,
      shouldDirty: true,
    });

    toast.success('AI description generated successfully!');
  } catch (error) {
    console.error('Description generation failed:', error);

    toast.error(
      error instanceof Error
        ? error.message
        : 'Could not generate description. Please try again.'
    );
  } finally {
    setGeneratingDescription(false);
  }
};

const suggestPrice = async () => {
  const title = watch('title', '').trim();
  const originalPriceValue = watch('originalPrice');

  if (!title) {
    toast.error('Please enter the item title first.');
    return;
  }

  if (!selectedCategory || !selectedCondition) {
    toast.error('Please select category and condition first.');
    return;
  }

  if (!originalPriceValue || Number(originalPriceValue) <= 0) {
    toast.error('Please enter a valid original price first.');
    return;
  }

  setSuggestingPrice(true);

  try {
    const response = await fetch(
      'http://localhost:5001/api/ai/suggest-price',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: title,
          category: selectedCategory,
          condition: selectedCondition,
          originalPrice: Number(originalPriceValue),
        }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to suggest price.');
    }

    const suggestedPrice = Number(result.suggestedPrice);

    if (!Number.isFinite(suggestedPrice) || suggestedPrice <= 0) {
      throw new Error('AI returned an invalid price.');
    }

    setValue('price', suggestedPrice, {
      shouldValidate: true,
      shouldDirty: true,
    });

    toast.success(`Suggested price: ₹${suggestedPrice}`);
  } catch (error) {
    console.error('Price suggestion error:', error);
    toast.error(
      error instanceof Error
        ? error.message
        : 'Could not suggest a price.'
    );
  } finally {
    setSuggestingPrice(false);
  }
};


  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        setImages(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const [submitting, setSubmitting] = useState(false);
  const [generatingDescription, setGeneratingDescription] = useState(false);

  const removeImage = (i: number) => setImages(prev => prev.filter((_, idx) => idx !== i));

  // Upload a base64 data URL to the server and return a persistent URL
  const uploadImage = async (dataUrl: string): Promise<string> => {
    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUrl }),
    });
    if (!res.ok) throw new Error('Image upload failed');
    const { url } = await res.json();
    return url as string;
  };

  
const onSubmit = async (data: FormData) => {
  if (!selectedCategory) {
    toast.error('Please select a category');
    return;
  }

  if (!selectedCondition) {
    toast.error('Please select a condition');
    return;
  }

  setSubmitting(true);

  try {
    let imageUrl =
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=900&q=80';

    if (images.length > 0) {
      try {
        imageUrl = await uploadImage(images[0]);
      } catch {
        toast.info('Image upload failed, using default photo');
      }
    }

    const created = await postListing({
      title: data.title,
      description: data.description,
      price: String(data.price),
      originalPrice: String(data.originalPrice || data.price),
      category: selectedCategory,
      condition: selectedCondition,
      location: data.location,
      image: imageUrl,
      ...(session?.user?.email
        ? {
            sellerEmail: session.user.email,
            sellerName: session.user.name,
          }
        : {}),
    });

    // Read the moderation result returned by the backend.
    const result = created as ApiListing & {
      moderationStatus?: ModerationStatus;
      message?: string;
      reasons?: string[];
    };

    const status = result.moderationStatus ?? 'approved';

    setModerationStatus(status);
    setModerationReasons(result.reasons ?? []);

    if (status === 'review') {
      toast.info('Listing submitted for manual review.');
    } else {
      toast.success('Listing published successfully!');
    }

    setNewListing(created);
    setSubmitted(true);
  } catch (error) {
    console.error('Failed to post listing:', error);

    toast.error(
      error instanceof Error
        ? error.message
        : 'Failed to post listing. Please try again.'
    );
  } finally {
    setSubmitting(false);
  }
};


  if (submitted && newListing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
          className="text-center max-w-md mx-auto w-full"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 250 }}
            className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle size={44} className="text-green-500" />
          </motion.div>
          <h2 className="text-3xl font-bold text-foreground font-heading mb-3">
          {moderationStatus === 'review'
          ? 'Listing Under Review'
          : 'Item Listed!'}
          </h2>
          <p className="text-muted-foreground mb-6">
           {moderationStatus === 'review'
           ? 'Your listing has been submitted for manual review. It will not appear in public browsing until approved.'
           : 'Your item is now live on CampusKart. Students can find and contact you.'}
          </p>

        {moderationStatus === 'review' && moderationReasons.length > 0 && (
       <div className="mb-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-left text-sm text-amber-900">
        <p className="font-semibold">Reason for review</p>
        <ul className="mt-2 list-disc pl-5">
        {moderationReasons.map((reason, index) => (
          <li key={index}>{reason}</li>
        ))}
       </ul>
     </div>
 )}

          {/* Preview card of the new listing */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-card border border-border rounded-3xl overflow-hidden mb-6 text-left"
          >
            <div className="h-40 bg-muted overflow-hidden">
              <img
                src={newListing.image}
                alt={newListing.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="font-bold text-foreground font-heading text-sm line-clamp-1">{newListing.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex-shrink-0 ${
                   moderationStatus === 'review'
                   ? 'bg-amber-100 text-amber-800'
                   : 'bg-green-100 text-green-700'
                  }`}
                 >
               {moderationStatus === 'review' ? 'Under Review' : 'Live'}
               </span>
              </div>
              <p className="text-primary font-bold text-lg">₹{newListing.price.toLocaleString()}</p>
              <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                <span className="px-2 py-0.5 rounded-full bg-muted font-medium">{newListing.category}</span>
                <span>{newListing.condition}</span>
                <span>{newListing.location}</span>
              </div>
            </div>
          </motion.div>

          <div className="flex gap-3 justify-center">
            {moderationStatus === 'approved' && (
          <Link
               to={`/listing/${newListing.id}`}
                className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-all">
                View Listing
                <ArrowRight size={15} />
          </Link>
         )}
            <Link
              to="/listings"
              className="px-6 py-3 rounded-2xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground transition-all"
            >
              Browse All
            </Link>
            <button
              onClick={() => { setSubmitted(false); setNewListing(null); setImages([]); setSelectedCategory(''); setSelectedCondition(''); }}
              className="px-6 py-3 rounded-2xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground transition-all"
            >
              Post Another
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Sell an Item — CampusKart</title>
        <meta name="description" content="List your item for sale on CampusKart. Reach hundreds of students on your campus — books, electronics, bikes, furniture and more." />
        <link rel="canonical" href="https://campusKart.in/sell" />
        <meta property="og:title" content="Sell an Item — CampusKart" />
        <meta property="og:description" content="List your item for sale on CampusKart. Reach hundreds of students on your campus." />
        <meta property="og:url" content="https://campusKart.in/sell" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://campusKart.in/og-home.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://campusKart.in/og-home.png" />
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-background py-10">
        <div className="container mx-auto px-4 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">It's free</p>
              <h1 className="text-3xl font-bold text-foreground font-heading tracking-tight">Post an Item</h1>
              <p className="text-muted-foreground mt-1">Fill in the details below to list your item</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Photo upload */}
              <div className="bg-card border border-border rounded-3xl p-6">
                <h2 className="text-sm font-bold text-foreground font-heading mb-4 flex items-center gap-2">
                  <Camera size={16} className="text-primary" />
                  Photos <span className="text-muted-foreground font-normal">(up to 5)</span>
                </h2>

                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                  {images.map((img, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative aspect-square rounded-2xl overflow-hidden border border-border group"
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} className="text-white" />
                      </button>
                      {i === 0 && (
                        <span className="absolute bottom-1 left-1 text-[9px] font-bold bg-primary text-white px-1.5 py-0.5 rounded-full">Cover</span>
                      )}
                    </motion.div>
                  ))}

                  {images.length < 5 && (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="aspect-square rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-secondary transition-all duration-150 flex flex-col items-center justify-center gap-1 group"
                    >
                      <Upload size={18} className="text-muted-foreground group-hover:text-primary transition-colors" />
                      <span className="text-[10px] font-semibold text-muted-foreground group-hover:text-primary">Add</span>
                    </button>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
              </div>

              {/* Basic info */}
              <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-foreground font-heading flex items-center gap-2">
                  <Tag size={16} className="text-primary" />
                  Item Details
                </h2>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Title *</label>
                  <input
                    {...register('title', { required: 'Title is required', minLength: { value: 5, message: 'At least 5 characters' } })}
                    placeholder="e.g. Engineering Textbooks Bundle"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                  />
                  {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
                  <p className="text-xs text-muted-foreground mt-1">{titleValue.length}/100</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Description *</label>
                  <button
                 type="button"
                 onClick={generateDescription}
                 disabled={generatingDescription}
                 className="mb-3 inline-flex items-center gap-2 rounded-xl border border-primary/30 px-4 py-2 text-sm font-semibold text-primary hover:bg-secondary transition-all disabled:opacity-60"
                >
                <Sparkles size={16} />
                {generatingDescription
                ? 'Generating description...'
                : 'Generate Description with AI'}
                </button>
                  <textarea
                    {...register('description', { required: 'Description is required', minLength: { value: 20, message: 'At least 20 characters' } })}
                    rows={4}
                    placeholder="Describe your item — condition, age, what's included..."
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all resize-none"
                  />
                  {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description.message}</p>}
                </div>
              </div>

              {/* Category */}
              <div className="bg-card border border-border rounded-3xl p-6">
                <h2 className="text-sm font-bold text-foreground font-heading mb-4">Category *</h2>
                <div className="grid grid-cols-4 gap-3">
                  {CATEGORIES.map(cat => {
                    const Icon = cat.icon;
                    const active = selectedCategory === cat.label;
                    return (
                      <motion.button
                        key={cat.label}
                        type="button"
                        onClick={() => setSelectedCategory(cat.label)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.97 }}
                        className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-150 ${
                          active ? 'border-primary bg-secondary' : 'border-border hover:border-primary/40'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                          <Icon size={18} className="text-white" />
                        </div>
                        <span className="text-[11px] font-semibold text-foreground">{cat.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Condition */}
              <div className="bg-card border border-border rounded-3xl p-6">
                <h2 className="text-sm font-bold text-foreground font-heading mb-4">Condition *</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {CONDITIONS.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSelectedCondition(c)}
                      className={`py-3 rounded-2xl border-2 text-sm font-semibold transition-all duration-150 ${
                        selectedCondition === c ? 'border-primary bg-secondary text-primary' : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-card border border-border rounded-3xl p-6 space-y-4">
                <h2 className="text-sm font-bold text-foreground font-heading flex items-center gap-2">
                  <IndianRupee size={16} className="text-primary" />
                  Pricing
                </h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    
              <div className="flex items-center justify-between gap-2 mb-1.5">
               <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
               Your Price *
               </label>

              <button
              type="button"
              onClick={suggestPrice}
              disabled={suggestingPrice}
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline disabled:opacity-60"
             >
            <Sparkles size={14} />
           {suggestingPrice ? 'Suggesting...' : 'Suggest Price with AI'}
              </button>
            </div>

                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">₹</span>
                      <input
                        type="number"
                        {...register('price', { required: 'Price is required', min: { value: 1, message: 'Must be > 0' } })}
                        placeholder="450"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                      />
                    </div>
                    {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
                  </div>
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-1.5 block">Original Price</label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-bold">₹</span>
                      <input
                        type="number"
                        {...register('originalPrice')}
                        placeholder="1200"
                        className="w-full pl-8 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-card border border-border rounded-3xl p-6">
                <h2 className="text-sm font-bold text-foreground font-heading flex items-center gap-2 mb-4">
                  <MapPin size={16} className="text-primary" />
                  Pickup Location
                </h2>
                <input
                  {...register('location', { required: 'Location is required' })}
                  placeholder="e.g. Hostel Block A, Main Campus Gate..."
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                />
                {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location.message}</p>}
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all duration-150 disabled:opacity-60"
                disabled={submitting}
              >
                {submitting ? 'Posting...' : 'Post Listing — Free'}
              </motion.button>

              <p className="text-center text-xs text-muted-foreground">
                By posting, you agree to our{' '}
                <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
              </p>
            </form>
          </motion.div>
        </div>
      </div>
    </>
  );
}

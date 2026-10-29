// Shared API client for CampusKart
const TOKEN_KEY = 'campuskart-token';

export type ApiListing = {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  category: string;
  condition: string;
  location: string;
  image: string;
  tag: string | null;
  tagColor: string | null;
  createdAt: string;
  seller: string;
  sellerAvatar: string;
  sellerAvatarBg: string;
  sellerVerified: boolean;
  sellerRating: string;
  sellerSales?: number;
  rating: string;
  reviews: number | ApiReview[];
  reviewCount?: number;
  saved: boolean;
  postedAt?: string;
  description?: string;
  images?: string[];
  related?: ApiListing[];
};

export type ApiReview = {
  id: number;
  rating: number;
  text: string;
  createdAt: string;
  reviewerName: string;
  reviewerAvatar: string;
  reviewerAvatarBg: string;
};

export type ListingsResponse = {
  listings: ApiListing[];
  total: number;
  page: number;
  limit: number;
};

export async function fetchListings(params: Record<string, string> = {}): Promise<ListingsResponse> {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/listings${qs ? `?${qs}` : ''}`);
  if (!res.ok) throw new Error('Failed to fetch listings');
  return res.json();
}

export async function fetchListing(id: string): Promise<ApiListing> {
  const res = await fetch(`/api/listings/${id}`);
  if (!res.ok) throw new Error('Listing not found');
  return res.json();
}

export async function postListing(data: Record<string, string>): Promise<ApiListing> {
  const res = await fetch('/api/listings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Failed to post listing');
  }
  return res.json();
}

export async function toggleSave(listingId: string, userId = 1): Promise<{ saved: boolean }> {
  const res = await fetch(`/api/listings/${listingId}/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!res.ok) throw new Error('Failed to save');
  return res.json();
}

export async function fetchSaved(userId = 1): Promise<ApiListing[]> {
  const res = await fetch(`/api/saved?userId=${userId}`);
  if (!res.ok) throw new Error('Failed to fetch saved');
  return res.json();
}

export async function postReview(listingId: string, data: { rating: number; text: string; userId?: number }): Promise<ApiReview> {
  const res = await fetch(`/api/listings/${listingId}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to post review');
  return res.json();
}

export async function fetchUserListings(userId = 1): Promise<ApiListing[]> {
  const res = await fetch(`/api/users/${userId}/listings`);
  if (!res.ok) throw new Error('Failed to fetch user listings');
  return res.json();
}

// Format a listing from the API into the shape the UI components expect
export function formatListing(l: ApiListing) {
  return {
    ...l,
    reviews: typeof l.reviews === 'number' ? l.reviews : (l.reviewCount ?? (l.reviews as ApiReview[]).length),
    postedAt: l.postedAt ?? (l.createdAt ? new Date(l.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recently'),
    sellerSales: l.sellerSales ?? 0,
  };
}


export async function deleteListing(id: string): Promise<void> {
  const token =
    typeof window !== 'undefined'
      ? window.localStorage.getItem(TOKEN_KEY)
      : null;

  const res = await fetch(
    `/api/listings/${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers: token
        ? { Authorization: `Bearer ${token}` }
        : {},
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message ?? 'Failed to delete listing');
  }
}

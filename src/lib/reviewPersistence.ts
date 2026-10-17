import { doc, getDoc, setDoc, collection, query, where, getDocs, onSnapshot, orderBy } from 'firebase/firestore';
import { db, auth } from './firebase';
import { FilamentProduct, ProductReview } from '../types';

const LOCAL_REVIEWS_KEY = 'printcore_product_reviews_v1';
const LOCAL_STATS_KEY = 'printcore_product_stats_v1';

// Real reviews persistence (no simulated/mock seed reviews; 100% genuine customer reviews)
const SEED_REVIEWS: Record<string, ProductReview[]> = {};

// Helper: Get local reviews from localStorage
function getLocalReviews(): ProductReview[] {
  try {
    const raw = localStorage.getItem(LOCAL_REVIEWS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse local reviews:', e);
  }
  return [];
}

// Helper: Save local reviews to localStorage
function saveLocalReviews(reviews: ProductReview[]): void {
  try {
    localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(reviews));
  } catch (e) {
    console.warn('Failed to persist local reviews:', e);
  }
}

// Helper: Get local stats
export function getLocalProductStats(): Record<string, { rating: number; reviewsCount: number }> {
  try {
    const raw = localStorage.getItem(LOCAL_STATS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse local stats:', e);
  }
  return {};
}

// Helper: Save local stats
export function saveLocalProductStats(stats: Record<string, { rating: number; reviewsCount: number }>): void {
  try {
    localStorage.setItem(LOCAL_STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn('Failed to persist local stats:', e);
  }
}

/**
 * Persists a new customer review to Firestore and recalculates aggregate product rating
 */
export async function saveProductReview(
  review: ProductReview,
  currentProduct: FilamentProduct
): Promise<{ updatedProduct: FilamentProduct; savedReview: ProductReview }> {
  // 1. Calculate new rating and reviewsCount
  const currentCount = Number(currentProduct.reviewsCount) || 0;
  const currentRating = Number(currentProduct.rating) || 5.0;
  const newCount = currentCount + 1;
  const totalScore = (currentRating * currentCount) + Number(review.rating);
  const newRating = Number((totalScore / newCount).toFixed(1));

  const updatedProduct: FilamentProduct = {
    ...currentProduct,
    rating: newRating,
    reviewsCount: newCount,
  };

  const reviewDoc: ProductReview = {
    ...review,
    createdAt: review.createdAt || new Date().toISOString(),
    printerModel: review.printerModel || '3D 列印創客',
    verifiedPurchase: review.verifiedPurchase !== false,
  };

  // 2. Cache in localStorage immediately for instant UI update & zero latency
  const allReviews = getLocalReviews();
  const filtered = allReviews.filter((r) => r.id !== reviewDoc.id);
  filtered.unshift(reviewDoc);
  saveLocalReviews(filtered);

  const localStats = getLocalProductStats();
  localStats[currentProduct.id] = { rating: newRating, reviewsCount: newCount };
  saveLocalProductStats(localStats);

  // 3. Persist review document to Firestore `/reviews/{id}`
  try {
    const reviewRef = doc(db, 'reviews', reviewDoc.id);
    await setDoc(reviewRef, {
      id: reviewDoc.id,
      productId: reviewDoc.productId,
      userId: reviewDoc.userId,
      userName: reviewDoc.userName,
      rating: reviewDoc.rating,
      comment: reviewDoc.comment,
      createdAt: reviewDoc.createdAt,
    });
    console.log(`⭐ Review ${reviewDoc.id} saved to Firestore for product ${currentProduct.id}`);
  } catch (err) {
    console.warn('Firestore review document sync notice:', err);
  }

  // 4. Persist aggregate product stats to Firestore `/productStats/{productId}`
  try {
    const statsRef = doc(db, 'productStats', currentProduct.id);
    await setDoc(statsRef, {
      id: currentProduct.id,
      productId: currentProduct.id,
      rating: newRating,
      reviewsCount: newCount,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    console.log(`📊 ProductStats updated in Firestore for ${currentProduct.id}: ${newRating}★ (${newCount})`);
  } catch (err) {
    console.warn('Firestore productStats sync notice:', err);
  }

  return { updatedProduct, savedReview: reviewDoc };
}

/**
 * Loads all reviews for a specific product from Firestore (with local cache fallback)
 */
export async function loadProductReviews(productId: string): Promise<ProductReview[]> {
  const localList = getLocalReviews().filter((r) => r.productId === productId);
  const seedList = SEED_REVIEWS[productId] || [];

  try {
    const q = query(collection(db, 'reviews'), where('productId', '==', productId));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const dbReviews: ProductReview[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        dbReviews.push({
          id: data.id || d.id,
          productId: data.productId || productId,
          userId: data.userId || 'maker',
          userName: data.userName || '創客玩家',
          rating: Number(data.rating) || 5,
          comment: data.comment || '',
          createdAt: data.createdAt || new Date().toISOString(),
          printerModel: data.printerModel || '3D 創客設備',
          verifiedPurchase: data.verifiedPurchase !== false,
        });
      });

      // Merge dbReviews with local and seed without duplicates
      const map = new Map<string, ProductReview>();
      seedList.forEach((r) => map.set(r.id, r));
      localList.forEach((r) => map.set(r.id, r));
      dbReviews.forEach((r) => map.set(r.id, r));

      const combined = Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      return combined;
    }
  } catch (err) {
    console.warn('Firestore loadProductReviews notice:', err);
  }

  // Fallback to local and seeds
  const map = new Map<string, ProductReview>();
  seedList.forEach((r) => map.set(r.id, r));
  localList.forEach((r) => map.set(r.id, r));
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

/**
 * Loads all updated product statistics from Firestore
 */
export async function loadAllProductStats(): Promise<Record<string, { rating: number; reviewsCount: number }>> {
  const localStats = getLocalProductStats();

  try {
    const snapshot = await getDocs(collection(db, 'productStats'));
    if (!snapshot.empty) {
      const result: Record<string, { rating: number; reviewsCount: number }> = { ...localStats };
      snapshot.forEach((d) => {
        const data = d.data();
        if (data.productId && typeof data.rating === 'number') {
          result[data.productId] = {
            rating: Number(data.rating),
            reviewsCount: Number(data.reviewsCount) || 0,
          };
        }
      });
      saveLocalProductStats(result);
      return result;
    }
  } catch (err) {
    console.warn('Firestore loadAllProductStats notice:', err);
  }

  return localStats;
}

/**
 * Real-time listener for product reviews
 */
export function subscribeToProductReviews(
  productId: string,
  callback: (reviews: ProductReview[]) => void
): () => void {
  try {
    const q = query(collection(db, 'reviews'), where('productId', '==', productId));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const dbReviews: ProductReview[] = [];
        snapshot.forEach((d) => {
          const data = d.data();
          dbReviews.push({
            id: data.id || d.id,
            productId: data.productId || productId,
            userId: data.userId || 'maker',
            userName: data.userName || '創客玩家',
            rating: Number(data.rating) || 5,
            comment: data.comment || '',
            createdAt: data.createdAt || new Date().toISOString(),
            printerModel: data.printerModel || '3D 創客設備',
            verifiedPurchase: data.verifiedPurchase !== false,
          });
        });

        const seedList = SEED_REVIEWS[productId] || [];
        const localList = getLocalReviews().filter((r) => r.productId === productId);
        const map = new Map<string, ProductReview>();
        seedList.forEach((r) => map.set(r.id, r));
        localList.forEach((r) => map.set(r.id, r));
        dbReviews.forEach((r) => map.set(r.id, r));

        const combined = Array.from(map.values()).sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        callback(combined);
      },
      (error) => {
        console.warn('Firestore reviews snapshot error:', error);
        loadProductReviews(productId).then(callback);
      }
    );
    return unsubscribe;
  } catch (e) {
    console.warn('Could not establish real-time snapshot for reviews:', e);
    loadProductReviews(productId).then(callback);
    return () => {};
  }
}

/**
 * Real-time listener for all product statistics
 */
export function subscribeToProductStats(
  callback: (stats: Record<string, { rating: number; reviewsCount: number }>) => void
): () => void {
  try {
    const unsubscribe = onSnapshot(
      collection(db, 'productStats'),
      (snapshot) => {
        const result: Record<string, { rating: number; reviewsCount: number }> = getLocalProductStats();
        snapshot.forEach((d) => {
          const data = d.data();
          if (data.productId && typeof data.rating === 'number') {
            result[data.productId] = {
              rating: Number(data.rating),
              reviewsCount: Number(data.reviewsCount) || 0,
            };
          }
        });
        saveLocalProductStats(result);
        callback(result);
      },
      (error) => {
        console.warn('Firestore stats snapshot error:', error);
        loadAllProductStats().then(callback);
      }
    );
    return unsubscribe;
  } catch (e) {
    console.warn('Could not establish real-time snapshot for stats:', e);
    loadAllProductStats().then(callback);
    return () => {};
  }
}

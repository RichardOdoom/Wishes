'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, orderBy, serverTimestamp, writeBatch, Timestamp, doc } from 'firebase/firestore';
import type { Wish } from '@/lib/types';
import { initialWishes } from '@/lib/store';

const WISHES_COLLECTION = 'wishes';

const mapDocToWish = (doc: any): Wish => {
  const data = doc.data();
  const createdAt = (data.createdAt as Timestamp)?.toDate()?.toISOString() ?? new Date().toISOString();
  return {
    id: doc.id,
    name: data.name,
    message: data.message,
    createdAt,
  };
};

async function seedWishes() {
  if (!db) {
    console.warn("Cannot seed wishes, Firebase is not configured.");
    return;
  }
  const batch = writeBatch(db);
  initialWishes.forEach((wish) => {
    const docRef = doc(collection(db, WISHES_COLLECTION));
    const { createdAt, ...rest } = wish;
    batch.set(docRef, { ...rest, createdAt: serverTimestamp() });
  });

  await batch.commit();
  console.log('Database seeded with initial wishes successfully!');
}

export async function getWishes(): Promise<Wish[]> {
  if (!db) {
    console.warn("Firebase not configured. Returning initial static data.");
    return initialWishes.map((w, i) => ({ ...w, id: `static-id-${i}`}));
  }

  const wishesCollection = collection(db, WISHES_COLLECTION);
  const q = query(wishesCollection, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    console.log('No wishes found, seeding database...');
    await seedWishes();
    const seededSnapshot = await getDocs(q);
    return seededSnapshot.docs.map(mapDocToWish);
  }
  
  return snapshot.docs.map(mapDocToWish);
}

export async function getWishesWithPassword(password: string): Promise<Wish[] | null> {
  const correctPassword = process.env.WISHES_PASSWORD;

  if (!correctPassword) {
    console.error("WISHES_PASSWORD environment variable not set.");
    return null;
  }

  if (password === correctPassword) {
    return getWishes();
  }
  
  return null;
}

export async function addWish(wishData: Omit<Wish, 'id' | 'createdAt'>): Promise<Wish> {
  if (!db) {
    console.warn("Firebase not configured. This wish will not be saved.");
    const newWish: Wish = { ...wishData, id: `static-id-${Date.now()}`, createdAt: new Date().toISOString() };
    return newWish;
  }

  const wishesCollection = collection(db, WISHES_COLLECTION);
  
  const docRef = await addDoc(wishesCollection, {
    ...wishData,
    createdAt: serverTimestamp(),
  });

  return { 
    id: docRef.id, 
    ...wishData, 
    createdAt: new Date().toISOString() 
  };
}

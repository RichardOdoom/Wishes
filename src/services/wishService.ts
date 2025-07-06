'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, addDoc, query, orderBy, serverTimestamp, writeBatch, Timestamp, doc } from 'firebase/firestore';
import type { Wish } from '@/lib/types';
import { initialWishes } from '@/lib/store';

const WISHES_COLLECTION = 'wishes';

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

export async function seedInitialWishes() {
    if (!db) return;
    const wishesCollection = collection(db, WISHES_COLLECTION);
    const snapshot = await getDocs(wishesCollection);
    if (snapshot.empty) {
        console.log('No wishes found, seeding database...');
        await seedWishes();
    }
}

export async function checkPassword(password: string): Promise<boolean> {
  const correctPassword = process.env.WISHES_PASSWORD;

  if (!correctPassword) {
    console.error("WISHES_PASSWORD environment variable not set.");
    // Fallback for local dev if env is not set.
    if (process.env.NODE_ENV === 'development') {
      return password === 'birthday2024';
    }
    return false;
  }

  return password === correctPassword;
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

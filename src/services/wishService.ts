'use server';

import { db } from '@/lib/firebase';
import type { Wish } from '@/lib/types';
import { initialWishes } from '@/lib/store';
import { collection, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

async function seedWishes() {
  if (!db) {
    console.warn("Cannot seed wishes, Firebase is not configured.");
    return;
  }
  
  try {
    const wishesToSeed = initialWishes.map(({ name, message }) => ({
      name,
      message,
      createdAt: serverTimestamp()
    }));

    const wishesCollection = collection(db, 'wishes');
    for (const wish of wishesToSeed) {
      await addDoc(wishesCollection, wish);
    }
    console.log('Database seeded with initial wishes successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

export async function seedInitialWishes() {
    if (!db) return;

    try {
      const wishesCollection = collection(db, 'wishes');
      const snapshot = await getDocs(wishesCollection);
      
      if (snapshot.empty) {
          console.log('No wishes found, seeding database...');
          await seedWishes();
      }
    } catch (error) {
       console.error("Could not check for wishes:", error);
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

  try {
    const wishesCollection = collection(db, 'wishes');
    const docRef = await addDoc(wishesCollection, {
      ...wishData,
      createdAt: serverTimestamp()
    });

    // The real-time listener will handle updating the UI with the correct data.
    // This return is mostly for optimistic updates if we weren't using real-time.
    return {
      ...wishData,
      id: docRef.id,
      createdAt: new Date().toISOString(), 
    };
  } catch (error) {
    console.error('Failed to add wish:', error);
    throw new Error('Could not save wish to the database.');
  }
}

'use server';

import { db } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, addDoc, query, writeBatch } from 'firebase/firestore';
import type { Profile } from '@/lib/types';
import { initialProfiles } from '@/lib/store';

const PROFILES_COLLECTION = 'profiles';

async function seedProfiles() {
  const batch = writeBatch(db);
  const profilesCollection = collection(db, PROFILES_COLLECTION);

  initialProfiles.forEach((profile) => {
    const docRef = doc(collection(db, PROFILES_COLLECTION));
    batch.set(docRef, profile);
  });

  await batch.commit();
  console.log('Database seeded successfully!');
}

export async function getProfiles(): Promise<Profile[]> {
  const profilesCollection = collection(db, PROFILES_COLLECTION);
  const snapshot = await getDocs(query(profilesCollection));
  
  if (snapshot.empty) {
    console.log('No profiles found, seeding database...');
    await seedProfiles();
    const seededSnapshot = await getDocs(query(profilesCollection));
    return seededSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Profile));
  }
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Profile));
}

export async function addProfile(profileData: Omit<Profile, 'id'>): Promise<Profile> {
  const profilesCollection = collection(db, PROFILES_COLLECTION);
  const docRef = await addDoc(profilesCollection, profileData);
  return { id: docRef.id, ...profileData } as Profile;
}

export async function updateProfile(profile: Profile): Promise<Profile> {
  const profileDoc = doc(db, PROFILES_COLLECTION, profile.id);
  const { id, ...profileData } = profile;
  await setDoc(profileDoc, profileData, { merge: true });
  return profile;
}

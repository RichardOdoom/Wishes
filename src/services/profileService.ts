'use server';

import { db, storage } from '@/lib/firebase';
import { collection, getDocs, doc, setDoc, addDoc, query, writeBatch } from 'firebase/firestore';
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import type { Profile } from '@/lib/types';
import { initialProfiles } from '@/lib/store';

const PROFILES_COLLECTION = 'profiles';

async function seedProfiles() {
  if (!db) {
    console.warn("Cannot seed profiles, Firebase is not configured.");
    return;
  }
  const batch = writeBatch(db);
  initialProfiles.forEach((profile) => {
    const docRef = doc(collection(db, PROFILES_COLLECTION));
    batch.set(docRef, profile);
  });

  await batch.commit();
  console.log('Database seeded successfully!');
}

async function uploadPhoto(photoDataUrl: string, profileId: string): Promise<string> {
  if (!storage) {
      console.warn("Firebase Storage not available. Returning placeholder or original URL.");
      return photoDataUrl;
  }
  const storageRef = ref(storage, `profile-photos/${profileId}/${Date.now()}`);
  const snapshot = await uploadString(storageRef, photoDataUrl, 'data_url');
  const downloadURL = await getDownloadURL(snapshot.ref);
  return downloadURL;
}

export async function getProfiles(): Promise<Profile[]> {
  if (!db) {
    console.warn("Firebase not configured. Returning initial static data.");
    return initialProfiles.map((p, i) => ({ ...p, id: `static-id-${i}`}));
  }

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
  if (!db) {
    console.warn("Firebase not configured. This profile will not be saved.");
    const newProfile = { ...profileData, id: `static-id-${Date.now()}` };
    return newProfile;
  }

  const docRef = doc(collection(db, PROFILES_COLLECTION));
  const newId = docRef.id;
  let finalPhotoUrl = profileData.photoUrl;

  if (profileData.photoUrl.startsWith('data:image')) {
    finalPhotoUrl = await uploadPhoto(profileData.photoUrl, newId);
  }

  const finalProfileData = {
    ...profileData,
    photoUrl: finalPhotoUrl,
  };
  
  await setDoc(docRef, finalProfileData);
  return { id: newId, ...finalProfileData };
}

export async function updateProfile(profile: Profile): Promise<Profile> {
  if (!db) {
    console.warn("Firebase not configured. This update will not be saved.");
    return profile;
  }

  let finalProfile = { ...profile };

  if (profile.photoUrl.startsWith('data:image')) {
    finalProfile.photoUrl = await uploadPhoto(profile.photoUrl, profile.id);
  }

  const profileDoc = doc(db, PROFILES_COLLECTION, finalProfile.id);
  const { id, ...profileData } = finalProfile;
  await setDoc(profileDoc, profileData, { merge: true });
  return finalProfile;
}

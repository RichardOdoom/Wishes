'use server';

import { supabase } from '@/lib/supabase';
import type { Wish } from '@/lib/types';
import { initialWishes } from '@/lib/store';

async function seedWishes() {
  if (!supabase) {
    console.warn("Cannot seed wishes, Supabase is not configured.");
    return;
  }
  
  const wishesToSeed = initialWishes.map(({ name, message }) => ({ name, message }));

  const { error } = await supabase.from('wishes').insert(wishesToSeed);

  if (error) {
    console.error('Error seeding database:', error);
  } else {
    console.log('Database seeded with initial wishes successfully!');
  }
}

export async function seedInitialWishes() {
    if (!supabase) return;

    const { count, error } = await supabase
      .from('wishes')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error("Could not check for wishes:", error.message);
      return;
    }
    
    if (count === 0) {
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
  if (!supabase) {
    console.warn("Supabase not configured. This wish will not be saved.");
    const newWish: Wish = { ...wishData, id: `static-id-${Date.now()}`, createdAt: new Date().toISOString() };
    return newWish;
  }

  const { data, error } = await supabase
    .from('wishes')
    .insert([{ name: wishData.name, message: wishData.message }])
    .select()
    .single();

  if (error) {
    console.error('Failed to add wish:', error);
    throw new Error('Could not save wish to the database.');
  }

  return {
    ...data,
    createdAt: data.created_at,
  };
}

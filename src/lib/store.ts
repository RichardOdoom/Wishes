import type { Wish } from './types';

export const initialWishes: Omit<Wish, 'id'>[] = [
  {
    name: 'From The Team',
    message: 'Happy Birthday, Richard! We hope you have a fantastic day filled with joy and laughter. Thanks for being an amazing person!',
    createdAt: new Date().toISOString(),
  },
  {
    name: 'A Friendly Stranger',
    message: 'Wishing you the happiest of birthdays! May your year ahead be full of wonderful moments and success.',
    createdAt: new Date().toISOString(),
  },
];

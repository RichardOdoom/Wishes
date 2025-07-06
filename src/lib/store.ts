import { Heart, Users, Briefcase } from 'lucide-react';
import type { Category, Profile } from './types';

export const initialCategories: Category[] = [
  { id: 'all', name: 'All', icon: Users },
  { id: 'family', name: 'Family', icon: Heart },
  { id: 'friends', name: 'Friends', icon: Users },
  { id: 'coworkers', name: 'Coworkers', icon: Briefcase },
];

export const initialProfiles: Profile[] = [
  {
    id: '1',
    name: 'Mom',
    birthdate: new Date(1970, 4, 20),
    description: 'The best mom in the world. Loves gardening and cooking. Always there for me with a warm hug and good advice.',
    photoUrl: 'https://placehold.co/400x400.png',
    categoryId: 'family',
  },
  {
    id: '2',
    name: 'Alex',
    birthdate: new Date(1995, 6, 25),
    description: 'My best friend since college. We share a love for hiking, indie movies, and trying out new coffee shops. Alex has a dog named "Buddy".',
    photoUrl: 'https://placehold.co/400x400.png',
    categoryId: 'friends',
  },
  {
    id: '3',
    name: 'Jane Doe',
    birthdate: new Date(1988, 7, 1),
    description: 'A talented designer I work with. Very creative and always brings a positive attitude to the team. Big fan of sci-fi novels.',
    photoUrl: 'https://placehold.co/400x400.png',
    categoryId: 'coworkers',
  },
    {
    id: '4',
    name: 'Dad',
    birthdate: new Date(1962, 10, 12),
    description: 'My hero. Taught me how to ride a bike and how to be kind. Loves fishing and old rock music.',
    photoUrl: 'https://placehold.co/400x400.png',
    categoryId: 'family',
  },
];

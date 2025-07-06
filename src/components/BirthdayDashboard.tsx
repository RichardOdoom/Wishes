"use client";

import { useState, useEffect, useMemo } from 'react';
import { initialCategories, initialProfiles } from '@/lib/store';
import type { Profile, Category } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { PlusCircle, Gift } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import ProfileCard from './ProfileCard';
import ProfileForm from './ProfileForm';

export default function BirthdayDashboard() {
  const [profiles, setProfiles] = useState<Profile[]>(initialProfiles);
  const [categories] = useState<Category[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  const { toast } = useToast();

  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    profiles.forEach(profile => {
      const birthDateThisYear = new Date(today.getFullYear(), profile.birthdate.getMonth(), profile.birthdate.getDate());
      const nextBirthday = birthDateThisYear < today
        ? new Date(today.getFullYear() + 1, profile.birthdate.getMonth(), profile.birthdate.getDate())
        : birthDateThisYear;
      
      const daysUntil = differenceInDays(nextBirthday, today);

      if (daysUntil > 0 && daysUntil <= 7) {
        toast({
          title: "Upcoming Birthday!",
          description: `${profile.name}'s birthday is in ${daysUntil} day${daysUntil > 1 ? 's' : ''}!`,
          action: (
            <div className="text-2xl">
              <Gift className="text-primary" />
            </div>
          ),
        });
      }
    });
  }, [profiles, toast]);

  const handleSaveProfile = (profile: Profile) => {
    if (editingProfile) {
      setProfiles(profiles.map(p => (p.id === profile.id ? profile : p)));
    } else {
      setProfiles([...profiles, { ...profile, id: Date.now().toString() }]);
    }
    setEditingProfile(null);
  };

  const handleAddNew = () => {
    setEditingProfile(null);
    setIsFormOpen(true);
  }

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setIsFormOpen(true);
  }

  const filteredProfiles = useMemo(() => {
    if (selectedCategory === 'all') {
      return profiles;
    }
    return profiles.filter(p => p.categoryId === selectedCategory);
  }, [profiles, selectedCategory]);

  return (
    <div className="flex min-h-screen w-full bg-background font-body">
      <aside className="hidden md:flex flex-col w-64 p-4 bg-card border-r">
        <h2 className="text-2xl font-bold mb-6 font-headline text-primary-foreground/80">Categories</h2>
        <nav className="flex flex-col gap-2">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'ghost'}
              className="justify-start gap-3"
              onClick={() => setSelectedCategory(category.id)}
            >
              <category.icon className="h-5 w-5" />
              <span>{category.name}</span>
            </Button>
          ))}
        </nav>
      </aside>

      <div className="flex-1 p-6 md:p-10">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold font-headline text-primary-foreground/90">It'z Richard's Birthday</h1>
          <Button onClick={handleAddNew} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            <PlusCircle className="mr-2 h-5 w-5" />
            Add Loved One
          </Button>
        </header>

        {filteredProfiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProfiles.map(profile => (
              <ProfileCard key={profile.id} profile={profile} onEdit={handleEdit} />
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center p-12 text-center">
            <h3 className="text-xl font-semibold mb-2">No profiles yet</h3>
            <p className="text-muted-foreground mb-4">Add a loved one to get started!</p>
            <Button onClick={handleAddNew} variant="outline">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Loved One
            </Button>
          </Card>
        )}
      </div>

      <ProfileForm 
        isOpen={isFormOpen}
        setIsOpen={setIsFormOpen}
        onSave={handleSaveProfile}
        profile={editingProfile}
        categories={categories.filter(c => c.id !== 'all')}
      />
    </div>
  );
}

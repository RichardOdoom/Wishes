"use client";

import Image from 'next/image';
import type { Profile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Cake, Edit } from 'lucide-react';
import GenerateMessage from './GenerateMessage';
import { useState, useEffect } from 'react';
import { Skeleton } from './ui/skeleton';

interface ProfileDetailProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  profile: Profile;
  onEdit: (profile: Profile) => void;
}

export default function ProfileDetail({ isOpen, setIsOpen, profile, onEdit }: ProfileDetailProps) {
  const [isBirthday, setIsBirthday] = useState(false);
  const [birthDateString, setBirthDateString] = useState('');

  useEffect(() => {
    if (isOpen) {
      const today = new Date();
      const isBirthdayToday =
        profile.birthdate.getDate() === today.getDate() &&
        profile.birthdate.getMonth() === today.getMonth();
      setIsBirthday(isBirthdayToday);

      setBirthDateString(profile.birthdate.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }));
    }
  }, [isOpen, profile.birthdate]);
  
  const handleEditClick = () => {
    setIsOpen(false);
    onEdit(profile);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="relative w-full h-64 rounded-lg overflow-hidden mb-4">
             <Image
                src={profile.photoUrl}
                alt={profile.name}
                layout="fill"
                objectFit="cover"
                data-ai-hint="person portrait"
              />
               {isBirthday && (
                <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground animate-pulse z-10">
                  <Cake className="mr-2 h-4 w-4" />
                  Happy Birthday!
                </Badge>
              )}
          </div>
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle className="text-3xl font-headline">{profile.name}</DialogTitle>
              <DialogDescription>
                {birthDateString ? `Birthday: ${birthDateString}` : <Skeleton className="h-5 w-48" />}
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={handleEditClick}>
              <Edit className="h-5 w-5" />
              <span className="sr-only">Edit Profile</span>
            </Button>
          </div>
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div>
            <h3 className="font-semibold mb-2 text-primary-foreground/80">About {profile.name}</h3>
            <p className="text-muted-foreground">{profile.description}</p>
          </div>
          <GenerateMessage profileDescription={profile.description} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

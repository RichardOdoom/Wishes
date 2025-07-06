"use client";

import Image from 'next/image';
import type { Profile } from '@/lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Cake } from 'lucide-react';
import { useState, useEffect } from 'react';
import ProfileDetail from './ProfileDetail';
import { Skeleton } from './ui/skeleton';

interface ProfileCardProps {
  profile: Profile;
  onEdit: (profile: Profile) => void;
}

export default function ProfileCard({ profile, onEdit }: ProfileCardProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isBirthday, setIsBirthday] = useState(false);
  const [birthDateString, setBirthDateString] = useState('');

  useEffect(() => {
    const today = new Date();
    const isBirthdayToday =
      profile.birthdate.getDate() === today.getDate() &&
      profile.birthdate.getMonth() === today.getMonth();
    setIsBirthday(isBirthdayToday);

    setBirthDateString(profile.birthdate.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
    }));
  }, [profile.birthdate]);

  return (
    <>
      <Card 
        className="overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 cursor-pointer flex flex-col group"
        onClick={() => setIsDetailOpen(true)}
      >
        <CardHeader className="p-0 relative">
          <Image
            src={profile.photoUrl}
            alt={profile.name}
            width={400}
            height={400}
            className="aspect-square object-cover w-full transition-transform duration-300 group-hover:scale-105"
            data-ai-hint="person portrait"
          />
          {isBirthday && (
            <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground animate-pulse">
              <Cake className="mr-2 h-4 w-4" />
              Happy Birthday!
            </Badge>
          )}
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="text-2xl font-headline">{profile.name}</CardTitle>
        </CardContent>
        <CardFooter className="p-4 pt-0">
          {birthDateString ? 
            <p className="text-sm text-muted-foreground">{birthDateString}</p>
            : <Skeleton className="h-4 w-24" />
          }
        </CardFooter>
      </Card>
      <ProfileDetail 
        isOpen={isDetailOpen}
        setIsOpen={setIsDetailOpen}
        profile={profile}
        onEdit={onEdit}
      />
    </>
  );
}

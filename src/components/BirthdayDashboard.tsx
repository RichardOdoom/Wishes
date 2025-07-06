"use client";

import { useState, useEffect } from 'react';
import type { Wish } from '@/lib/types';
import { getWishes, addWish } from '@/services/wishService';
import WishForm from './WishForm';
import WishCard from './WishCard';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from './ui/skeleton';
import { PartyPopper } from 'lucide-react';
import { Card } from './ui/card';

export default function BirthdayDashboard() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    async function loadWishes() {
      try {
        setIsLoading(true);
        const fetchedWishes = await getWishes();
        setWishes(fetchedWishes);
      } catch (error) {
        console.error("Failed to fetch wishes:", error);
        toast({
          variant: "destructive",
          title: "Failed to load wishes",
          description: "Could not retrieve birthday wishes. Please try again later.",
        });
      } finally {
        setIsLoading(false);
      }
    }
    loadWishes();
  }, [toast]);
  
  const handleWishAdded = (newWish: Wish) => {
    setWishes(prevWishes => [newWish, ...prevWishes]);
  };

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-transparent font-body p-4 md:p-10">
      <header className="text-center my-8 md:my-12">
        <h1 className="text-5xl md:text-7xl font-bold font-headline text-primary">Happy Birthday, Richard!</h1>
        <p className="text-muted-foreground text-lg md:text-xl mt-4 max-w-3xl mx-auto">
          Today is my special day, and I'd love to celebrate with you! Please leave a birthday wish for me in the form below. Your messages mean the world to me.
        </p>
      </header>
      
      <div className="w-full max-w-2xl mb-12 z-10">
        <WishForm onWishAdded={handleWishAdded} addWishAction={addWish} />
      </div>

      <div className="w-full max-w-6xl">
        <h2 className="text-3xl font-bold font-headline text-primary-foreground/90 mb-8 text-center flex items-center justify-center gap-3">
          <PartyPopper className="h-8 w-8 text-accent"/>
          The Wish Wall
          <PartyPopper className="h-8 w-8 text-accent"/>
        </h2>
        {isLoading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="mb-6 break-inside-avoid">
                  <div className="p-6 space-y-4">
                      <div className="flex items-center gap-2">
                          <Skeleton className="h-6 w-6 rounded-full"/>
                          <Skeleton className="h-6 w-1/3"/>
                      </div>
                      <Skeleton className="h-4 w-full"/>
                      <Skeleton className="h-4 w-5/6"/>
                      <Skeleton className="h-4 w-3/4"/>
                  </div>
              </Card>
            ))}
          </div>
        ) : wishes.length > 0 ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {wishes.map(wish => (
              <WishCard key={wish.id} wish={wish} />
            ))}
          </div>
        ) : (
          <Card className="flex flex-col items-center justify-center p-12 text-center bg-card">
            <h3 className="text-xl font-semibold mb-2">The wall is empty!</h3>
            <p className="text-muted-foreground">Be the first one to leave a birthday wish for Richard.</p>
          </Card>
        )}
      </div>
       <footer className="mt-12 text-center text-muted-foreground text-sm">
        <p>Made with ❤️ for Richard's Birthday.</p>
      </footer>
    </div>
  );
}

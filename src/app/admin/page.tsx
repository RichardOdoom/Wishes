"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import type { Wish } from '@/lib/types';
import { getWishes } from '@/services/wishService';
import WishCard from '@/components/WishCard';
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from '@/components/ui/skeleton';
import { PartyPopper, LogOut } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isLoadingWishes, setIsLoadingWishes] = useState(true);

  useEffect(() => {
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Authentication not configured",
      });
      setIsLoadingAuth(false);
      router.push('/');
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [router, toast]);

  useEffect(() => {
    if (!isLoadingAuth && !user) {
      router.push('/login');
    }
  }, [user, isLoadingAuth, router]);

  useEffect(() => {
    async function loadWishes() {
      if (user) {
        try {
          setIsLoadingWishes(true);
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
          setIsLoadingWishes(false);
        }
      }
    }
    loadWishes();
  }, [user, toast]);

  const handleLogout = async () => {
    if (!auth) return;
    try {
        await signOut(auth);
        toast({ title: "Logged out successfully." });
        router.push('/login');
    } catch (error) {
        console.error("Logout failed:", error);
        toast({ variant: "destructive", title: "Logout Failed" });
    }
  };

  if (isLoadingAuth || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
            <PartyPopper className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Securing the wish vault...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-transparent font-body p-4 md:p-10">
      <header className="w-full max-w-6xl flex justify-between items-center my-8 md:my-12">
        <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">Your Wish Wall</h1>
        <Button onClick={handleLogout} variant="outline">
          <LogOut className="mr-2 h-4 w-4"/>
          Logout
        </Button>
      </header>
      
      <div className="w-full max-w-6xl">
        <h2 className="text-3xl font-bold font-headline text-primary-foreground/90 mb-8 text-center flex items-center justify-center gap-3">
          <PartyPopper className="h-8 w-8 text-accent"/>
          Here are your birthday messages!
          <PartyPopper className="h-8 w-8 text-accent"/>
        </h2>
        {isLoadingWishes ? (
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
            <p className="text-muted-foreground">No wishes yet. Share your link!</p>
          </Card>
        )}
      </div>
    </div>
  );
}

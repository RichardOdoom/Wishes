"use client";

import { useState, useEffect } from 'react';
import { addWish, checkPassword, seedInitialWishes } from '@/services/wishService';
import WishForm from './WishForm';
import { Card, CardContent } from './ui/card';
import { PartyPopper } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { Wish } from '@/lib/types';
import WishCard from '@/components/WishCard';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/lib/supabase';

export default function BirthdayDashboard() {
  const [showAreYouRichardPrompt, setShowAreYouRichardPrompt] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState('');
  const [showWishes, setShowWishes] = useState(false);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [isLoadingWishes, setIsLoadingWishes] = useState(false);
  const { toast } = useToast();

  const openPasswordPrompt = () => {
    setShowAreYouRichardPrompt(false);
    setShowPasswordPrompt(true);
  }

  useEffect(() => {
    if (!showWishes || !supabase) {
      return;
    }

    const fetchAndSubscribe = async () => {
      setIsLoadingWishes(true);
      
      await seedInitialWishes();

      const { data, error } = await supabase
        .from('wishes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Failed to fetch wishes:", error);
        toast({
          variant: "destructive",
          title: "Failed to load wishes",
          description: "Could not retrieve birthday wishes. Please try again later.",
        });
      } else if (data) {
        const fetchedWishes: Wish[] = data.map(w => ({ ...w, id: w.id.toString(), createdAt: w.created_at }));
        setWishes(fetchedWishes);
      }
      setIsLoadingWishes(false);
    };

    fetchAndSubscribe();

    const channel = supabase.channel('wishes-realtime-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'wishes' },
        (payload) => {
          const newWish = {
            ...payload.new,
            id: payload.new.id.toString(),
            createdAt: payload.new.created_at,
          } as Wish;
          
          setWishes((currentWishes) => [newWish, ...currentWishes]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [showWishes, toast]);

  const handlePasswordSubmit = async () => {
    setIsLoadingWishes(true);
    try {
      const isCorrect = await checkPassword(password);
      
      if (isCorrect) {
        setShowPasswordPrompt(false);
        setShowWishes(true);
      } else {
        toast({
          variant: "destructive",
          title: "Incorrect Password",
          description: "Sorry, You are not the birthday boy okaaayy",
        });
        setPassword('');
        setIsLoadingWishes(false);
      }
    } catch (error) {
      console.error("Failed to check password:", error);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: "Could not verify password. Please try again later.",
      });
      setIsLoadingWishes(false);
    }
  };

  if (showWishes) {
     return (
        <div className="flex flex-col items-center min-h-screen w-full bg-transparent font-body p-4 md:p-10">
          <header className="w-full max-w-6xl flex justify-between items-center my-8 md:my-12">
            <h1 className="text-4xl md:text-6xl font-bold font-headline text-primary">Your Wish Wall</h1>
             <Button onClick={() => setShowWishes(false)} variant="outline">
               Back to Main Page
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
                <p className="text-muted-foreground">No wishes yet. Be the first to seed some!</p>
              </Card>
            )}
          </div>
        </div>
      );
  }

  return (
    <div className="flex flex-col items-center min-h-screen w-full bg-transparent font-body p-4 md:p-10">
      <header className="text-center my-8 md:my-12">
        <h1 className="text-5xl md:text-7xl font-bold font-headline text-primary">Happy Birthday, Richard!</h1>
        <p className="text-muted-foreground text-lg md:text-xl mt-4 max-w-3xl mx-auto">
          Today is my special day, and I'd love to celebrate with you! Please leave a birthday wish for me in the form below. Your messages mean the world to me.
        </p>
      </header>
      
      <div className="w-full max-w-2xl mb-12 z-10">
        <WishForm addWishAction={addWish} />
      </div>

       <footer className="mt-12 text-center text-muted-foreground text-sm">
        <p>Made with ❤️ for Richard's Birthday.</p>
        
        <AlertDialog open={showAreYouRichardPrompt} onOpenChange={setShowAreYouRichardPrompt}>
            <AlertDialogTrigger asChild>
                <Button variant="link" className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors p-1">View Wishes</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Are you Richard?</AlertDialogTitle>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Not me</AlertDialogCancel>
                    <AlertDialogAction onClick={openPasswordPrompt}>Yes, I am!</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

        <AlertDialog open={showPasswordPrompt} onOpenChange={setShowPasswordPrompt}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Enter Password</AlertDialogTitle>
                    <AlertDialogDescription>
                       Please enter the password to view your birthday wishes.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <Input 
                    type="password" 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
                />
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handlePasswordSubmit}>View Wishes</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </footer>
    </div>
  );
}

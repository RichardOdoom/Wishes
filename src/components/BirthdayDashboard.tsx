"use client";

import { useState } from 'react';
import Link from 'next/link';
import { addWish } from '@/services/wishService';
import WishForm from './WishForm';
import { Card, CardContent } from './ui/card';
import { Gift } from 'lucide-react';

export default function BirthdayDashboard() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const handleWishAdded = () => {
    setIsSubmitted(true);
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
        {isSubmitted ? (
          <Card className="w-full max-w-2xl mx-auto shadow-2xl bg-card text-center p-8 md:p-12">
            <CardContent className="pt-6">
              <Gift className="h-16 w-16 text-accent mx-auto mb-6" />
              <h2 className="text-3xl font-bold font-headline text-primary-foreground/90 mb-4">Thank You!</h2>
              <p className="text-muted-foreground text-lg">
                Your wish has been sent. It will surely make Richard's day even brighter!
              </p>
            </CardContent>
          </Card>
        ) : (
          <WishForm onWishAdded={handleWishAdded} addWishAction={addWish} />
        )}
      </div>

       <footer className="mt-12 text-center text-muted-foreground text-sm">
        <p>Made with ❤️ for Richard's Birthday.</p>
        <Link href="/login" className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors">Admin Login</Link>
      </footer>
    </div>
  );
}

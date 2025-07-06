"use client";

import type { Wish } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';

interface WishCardProps {
  wish: Wish;
}

export default function ProfileCard({ wish }: WishCardProps) {
  const [timeAgo, setTimeAgo] = useState('');
  
  useEffect(() => {
    if (wish.createdAt) {
      const date = new Date(wish.createdAt);
      if (!isNaN(date.getTime())) {
        setTimeAgo(formatDistanceToNow(date, { addSuffix: true }));
      }
    }
  }, [wish.createdAt]);

  return (
    <Card className="shadow-lg break-inside-avoid bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-headline text-card-foreground">
          <Heart className="text-destructive fill-destructive" />
          {wish.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 text-lg">"{wish.message}"</p>
        <p className="text-xs text-muted-foreground/80 text-right">{timeAgo}</p>
      </CardContent>
    </Card>
  );
}

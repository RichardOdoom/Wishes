"use client";

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Wish } from '@/lib/types';
import { Send } from 'lucide-react';
import { useState } from 'react';

const wishSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50, "Name is too long."),
  message: z.string().min(10, "Your wish must be at least 10 characters.").max(500, "Your wish can't be more than 500 characters."),
});

type WishFormValues = z.infer<typeof wishSchema>;

interface WishFormProps {
  addWishAction: (wishData: Omit<Wish, 'id' | 'createdAt'>) => Promise<Wish>;
}

export default function WishForm({ addWishAction }: WishFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<WishFormValues>({
    resolver: zodResolver(wishSchema),
    defaultValues: {
      name: '',
      message: '',
    },
  });

  const onSubmit = async (data: WishFormValues) => {
    setIsSubmitting(true);
    try {
      await addWishAction(data);
      toast({
        title: "Wish sent!",
        description: "Thank you for your birthday wish!",
      });
      form.reset();
    } catch (error) {
      console.error("Failed to add wish:", error);
      toast({
        variant: "destructive",
        title: "Oops!",
        description: "Something went wrong. Please try sending your wish again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-2xl bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-2xl font-headline">
          <Send className="text-primary"/>
          Leave a Birthday Wish
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Jane Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Birthday Wish</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your birthday message for Richard here..."
                      className="resize-y min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isSubmitting} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground text-lg py-6">
              {isSubmitting ? 'Sending...' : 'Send My Wish!'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

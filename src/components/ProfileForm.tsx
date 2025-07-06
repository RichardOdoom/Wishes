"use client";

import { useEffect, useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Profile, Category } from '@/lib/types';
import Image from 'next/image';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, User } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  birthdate: z.date({ required_error: "A date of birth is required." }),
  description: z.string().min(10, "Description must be at least 10 characters.").max(500, "Description must be less than 500 characters."),
  photoUrl: z.string().optional().or(z.literal('')),
  categoryId: z.string({ required_error: "Please select a category." }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSave: (profile: Omit<Profile, 'id'>) => void;
  profile: Profile | null;
  categories: Category[];
}

export default function ProfileForm({ isOpen, setIsOpen, onSave, profile, categories }: ProfileFormProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      description: '',
      photoUrl: '',
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (profile) {
        form.reset({
          name: profile.name,
          birthdate: parseISO(profile.birthdate),
          description: profile.description,
          photoUrl: profile.photoUrl,
          categoryId: profile.categoryId,
        });
        setPreviewUrl(profile.photoUrl);
      } else {
        form.reset({
          name: '',
          birthdate: undefined,
          description: '',
          photoUrl: '',
          categoryId: undefined,
        });
        setPreviewUrl(null);
      }
    } else {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
    }
  }, [profile, isOpen, form]);
  
  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('photoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const onSubmit = (data: ProfileFormValues) => {
    const finalPhotoUrl = data.photoUrl || `https://placehold.co/400x400.png`;
    onSave({
      name: data.name,
      birthdate: data.birthdate.toISOString(),
      description: data.description,
      categoryId: data.categoryId,
      photoUrl: finalPhotoUrl,
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{profile ? 'Edit Profile' : 'Add New Loved One'}</DialogTitle>
          <DialogDescription>
            {profile ? 'Update the details of your loved one.' : 'Add a new person to your birthday list.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Mom" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthdate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Birthdate</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map(cat => (
                         <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us a little bit about them..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormItem>
              <FormLabel>Photo</FormLabel>
              <div className="flex items-center gap-4">
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Profile preview"
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded-full object-cover"
                    data-ai-hint="person portrait"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <FormControl>
                  <Input
                    type="file"
                    accept="image/png, image/jpeg, image/gif"
                    className="flex-1"
                    onChange={handlePhotoChange}
                    ref={fileInputRef}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-accent hover:bg-accent/90">Save</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { Profile, Category } from '@/lib/types';

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
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  birthdate: z.date({ required_error: "A date of birth is required." }),
  description: z.string().min(10, "Description must be at least 10 characters.").max(500, "Description must be less than 500 characters."),
  photoUrl: z.string().url("Please enter a valid URL.").optional().or(z.literal('')),
  categoryId: z.string({ required_error: "Please select a category." }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSave: (profile: Profile) => void;
  profile: Profile | null;
  categories: Category[];
}

export default function ProfileForm({ isOpen, setIsOpen, onSave, profile, categories }: ProfileFormProps) {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: '',
      description: '',
      photoUrl: '',
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        birthdate: profile.birthdate,
        description: profile.description,
        photoUrl: profile.photoUrl,
        categoryId: profile.categoryId,
      });
    } else {
      form.reset({
        name: '',
        birthdate: undefined,
        description: '',
        photoUrl: '',
        categoryId: undefined,
      });
    }
  }, [profile, isOpen, form]);

  const onSubmit = (data: ProfileFormValues) => {
    const photoUrl = data.photoUrl || `https://placehold.co/400x400.png`;
    onSave({
      ...data,
      id: profile?.id || '',
      photoUrl: photoUrl,
    } as Profile);
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
             <FormField
              control={form.control}
              name="photoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Photo URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://example.com/photo.jpg" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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

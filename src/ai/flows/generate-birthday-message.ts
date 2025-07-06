'use server';

/**
 * @fileOverview A flow that generates a personalized birthday message based on the profile description of a loved one.
 *
 * - generateBirthdayMessage - A function that generates a personalized birthday message.
 * - GenerateBirthdayMessageInput - The input type for the generateBirthdayMessage function.
 * - GenerateBirthdayMessageOutput - The return type for the generateBirthdayMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateBirthdayMessageInputSchema = z.object({
  profileDescription: z
    .string()
    .describe('The description of the loved one whose birthday message is to be generated.'),
});
export type GenerateBirthdayMessageInput = z.infer<
  typeof GenerateBirthdayMessageInputSchema
>;

const GenerateBirthdayMessageOutputSchema = z.object({
  birthdayMessage: z
    .string()
    .describe('The generated personalized birthday message.'),
});
export type GenerateBirthdayMessageOutput = z.infer<
  typeof GenerateBirthdayMessageOutputSchema
>;

export async function generateBirthdayMessage(
  input: GenerateBirthdayMessageInput
): Promise<GenerateBirthdayMessageOutput> {
  return generateBirthdayMessageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateBirthdayMessagePrompt',
  input: {schema: GenerateBirthdayMessageInputSchema},
  output: {schema: GenerateBirthdayMessageOutputSchema},
  prompt: `You are a birthday message expert. You will generate a personalized birthday message based on the profile description of the loved one.

Profile Description: {{{profileDescription}}}

Ensure the message is appropriate and thoughtful.
`,
});

const generateBirthdayMessageFlow = ai.defineFlow(
  {
    name: 'generateBirthdayMessageFlow',
    inputSchema: GenerateBirthdayMessageInputSchema,
    outputSchema: GenerateBirthdayMessageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);

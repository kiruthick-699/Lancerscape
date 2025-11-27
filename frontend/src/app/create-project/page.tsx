'use client';

import { useAccount } from 'wagmi';
import { useCreateProject } from '@/lib/hooks/useFactory';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const projectSchema = z.object({
  title: z.string().min(1, 'Project title is required').min(3, 'Title must be at least 3 characters'),
  description: z.string().min(1, 'Description is required').min(10, 'Description must be at least 10 characters'),
});

type ProjectFormData = z.infer<typeof projectSchema>;

export default function CreateProjectPage() {
  const { address, isConnected } = useAccount();
  const { createProject, isPending, isConfirming, isSuccess, error } = useCreateProject();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
  });

  const onSubmit = async (data: ProjectFormData) => {
    if (!isConnected || !address) {
      return;
    }

    try {
      await createProject(data.title, data.description, address);
      reset();
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Project</h1>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField name="title" error={errors.title?.message}>
            <FormLabel>Project Title</FormLabel>
            <FormControl>
              <input
                {...register('title')}
                type="text"
                placeholder="Enter project title"
                className="w-full px-3 py-2 border rounded-md bg-background"
                disabled={isPending || isConfirming}
              />
            </FormControl>
            <FormMessage />
          </FormField>

          <FormField name="description" error={errors.description?.message}>
            <FormLabel>Project Description</FormLabel>
            <FormControl>
              <textarea
                {...register('description')}
                placeholder="Enter project description"
                rows={4}
                className="w-full px-3 py-2 border rounded-md bg-background"
                disabled={isPending || isConfirming}
              />
            </FormControl>
            <FormMessage />
          </FormField>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-800 dark:text-red-200 text-sm">
              Error: {error.message}
            </div>
          )}

          {isSuccess && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-green-800 dark:text-green-200 text-sm">
              Project created successfully! 🎉
            </div>
          )}

          <Button 
            type="submit" 
            disabled={!isConnected || isPending || isConfirming}
            className="w-full"
          >
            {isPending && 'Waiting for approval...'}
            {isConfirming && 'Confirming transaction...'}
            {!isPending && !isConfirming && 'Create Project'}
          </Button>

          {!isConnected && (
            <p className="text-sm text-muted-foreground text-center">
              Please connect your wallet to create a project
            </p>
          )}
        </form>
      </Card>
    </div>
  );
}

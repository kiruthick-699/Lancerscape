'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { useCreateProject } from '@/lib/hooks/useFactory';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function CreateProjectPage() {
  const { address, isConnected } = useAccount();
  const { createProject, isPending, isConfirming, isSuccess, error } = useCreateProject();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected || !address) {
      alert('Please connect your wallet first');
      return;
    }

    if (!title.trim() || !description.trim()) {
      alert('Please fill in all fields');
      return;
    }

    try {
      await createProject(title, description, address);
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Create Project</h1>
      
      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Project Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter project title"
              className="w-full px-3 py-2 border rounded-md bg-background"
              disabled={isPending || isConfirming}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-2">
              Project Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter project description"
              rows={4}
              className="w-full px-3 py-2 border rounded-md bg-background"
              disabled={isPending || isConfirming}
            />
          </div>

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

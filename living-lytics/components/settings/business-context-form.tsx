/**
 * Business Context Form Component
 * 
 * Allows users to manage their business context (goals, KPIs, brand, budgets)
 * for RAG-enhanced AI insights
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

type ContextType = 'goal' | 'kpi' | 'brand' | 'budget' | 'campaign' | 'industry';

interface BusinessContext {
  id: string;
  context_type: ContextType;
  content: string;
  metadata?: Record<string, any>;
  created_at: string;
}

const CONTEXT_TYPE_LABELS: Record<ContextType, string> = {
  goal: 'Business Goal',
  kpi: 'Key Performance Indicator',
  brand: 'Brand Positioning',
  budget: 'Budget Information',
  campaign: 'Campaign History',
  industry: 'Industry Context',
};

export function BusinessContextForm() {
  const [contexts, setContexts] = useState<BusinessContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // New context form
  const [newType, setNewType] = useState<ContextType>('goal');
  const [newContent, setNewContent] = useState('');

  // Load existing contexts
  useEffect(() => {
    loadContexts();
  }, []);

  async function loadContexts() {
    try {
      const response = await fetch('/api/context');
      if (!response.ok) throw new Error('Failed to load contexts');
      
      const data = await response.json();
      setContexts(data.contexts || []);
    } catch (error) {
      console.error('Error loading contexts:', error);
      toast.error('Failed to load business context');
    } finally {
      setLoading(false);
    }
  }

  async function handleAddContext() {
    if (!newContent.trim()) {
      toast.error('Please enter context content');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context_type: newType,
          content: newContent,
        }),
      });

      if (!response.ok) throw new Error('Failed to add context');

      const data = await response.json();
      setContexts([...contexts, data.context]);
      setNewContent('');
      toast.success('Business context added successfully');
    } catch (error) {
      console.error('Error adding context:', error);
      toast.error('Failed to add business context');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteContext(id: string) {
    try {
      const response = await fetch(`/api/context?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete context');

      setContexts(contexts.filter(c => c.id !== id));
      toast.success('Context deleted');
    } catch (error) {
      console.error('Error deleting context:', error);
      toast.error('Failed to delete context');
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">Business Context</h2>
        <p className="text-muted-foreground mt-1">
          Add your business goals, KPIs, and brand information to get personalized AI insights
        </p>
      </div>

      {/* Add New Context */}
      <div className="border rounded-lg p-4 space-y-4">
        <h3 className="font-semibold">Add New Context</h3>
        
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="context-type">Type</Label>
            <Select value={newType} onValueChange={(value) => setNewType(value as ContextType)}>
              <SelectTrigger id="context-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CONTEXT_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="context-content">Content</Label>
            <Textarea
              id="context-content"
              placeholder={getPlaceholder(newType)}
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              rows={4}
            />
          </div>

          <Button onClick={handleAddContext} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Context
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Existing Contexts */}
      <div className="space-y-4">
        <h3 className="font-semibold">Your Business Context ({contexts.length})</h3>
        
        {contexts.length === 0 ? (
          <div className="text-center p-8 border rounded-lg border-dashed">
            <p className="text-muted-foreground">
              No business context added yet. Add your first context above to get started.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {contexts.map((context) => (
              <div key={context.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded">
                        {CONTEXT_TYPE_LABELS[context.context_type]}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(context.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm whitespace-pre-wrap">{context.content}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteContext(context.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function getPlaceholder(type: ContextType): string {
  const placeholders: Record<ContextType, string> = {
    goal: 'Example: Increase online sales by 25% in Q1 2026 while maintaining a 4:1 ROAS',
    kpi: 'Example: Target conversion rate: 3.5%, Average order value: $85, Customer lifetime value: $450',
    brand: 'Example: Premium eco-friendly outdoor gear brand targeting millennials who value sustainability',
    budget: 'Example: Monthly ad spend: $15,000 (60% Meta, 30% Google, 10% Instagram)',
    campaign: 'Example: Summer 2025 campaign generated 45% increase in conversions with video ads',
    industry: 'Example: Outdoor recreation industry, competitive landscape includes Patagonia and REI',
  };
  
  return placeholders[type];
}

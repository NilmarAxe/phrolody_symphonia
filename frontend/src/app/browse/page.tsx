export const dynamic = 'force-dynamic';
import { Suspense } from 'react';
import BrowseClient from './BrowseClient';

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950" />}>
      <BrowseClient />
    </Suspense>
  );
}
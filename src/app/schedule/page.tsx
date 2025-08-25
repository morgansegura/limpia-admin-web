"use client";

import { AdvancedScheduler } from '@/components/scheduling/advanced-scheduler';
import '@/components/scheduling/calendar.css';

export default function SchedulePage() {
  return (
    <div className="container mx-auto py-6">
      <AdvancedScheduler />
    </div>
  );
}
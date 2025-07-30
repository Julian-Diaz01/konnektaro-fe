'use client';

import { Suspense } from "react";
import EventPageClient from "@/app/edit-event/EventPageClient";

export default function EventPage() {
  return (
    <Suspense fallback={null}>
      <EventPageClient />
    </Suspense>
  );
}
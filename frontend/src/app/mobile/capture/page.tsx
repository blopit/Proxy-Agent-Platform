'use client'

/**
 * Capture page route - redirects to main mobile page
 * The actual capture functionality is in /mobile with CaptureMode component
 */
import { redirect } from 'next/navigation';

export default function CapturePage() {
  redirect('/mobile');
}

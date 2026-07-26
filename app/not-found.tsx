"use client";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-[calc(100vh-64px)] items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-primary text-sm font-semibold tracking-widest uppercase">
          Error 404
        </p>

        <h1 className="mt-4 text-5xl font-bold tracking-tight">
          Page Not Found
        </h1>

        <p className="text-muted-foreground mt-4 text-base leading-7">
          Sorry, the page you are looking for doesn&apos;t exist or may have
          been moved.
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </main>
  );
}

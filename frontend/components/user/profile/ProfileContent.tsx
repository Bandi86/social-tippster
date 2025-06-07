'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { ReactNode } from 'react';

interface ProfileContentProps {
  title?: string;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyIcon?: ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: {
    label: string;
    href: string;
  };
  children?: ReactNode;
}

export default function ProfileContent({
  title,
  isLoading = false,
  isEmpty = false,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  children
}: ProfileContentProps) {
  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
        <CardContent className="p-6">
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full bg-gray-700" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-32 bg-gray-700" />
                    <Skeleton className="h-3 w-24 bg-gray-700" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-gray-700" />
                  <Skeleton className="h-4 w-3/4 bg-gray-700" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isEmpty) {
    return (
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
        {title && (
          <CardHeader>
            <CardTitle className="text-white">{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            {emptyIcon && (
              <div className="flex justify-center">
                {emptyIcon}
              </div>
            )}
            {emptyTitle && (
              <h3 className="text-lg font-semibold text-white">
                {emptyTitle}
              </h3>
            )}
            {emptyDescription && (
              <p className="text-gray-400 max-w-md mx-auto">
                {emptyDescription}
              </p>
            )}
            {emptyAction && (
              <Button
                asChild
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Link href={emptyAction.href}>
                  {emptyAction.label}
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {title && (
        <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">{title}</CardTitle>
          </CardHeader>
        </Card>
      )}
      {children}
    </div>
  );
}

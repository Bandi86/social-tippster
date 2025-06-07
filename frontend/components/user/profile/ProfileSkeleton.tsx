'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Profile Card Skeleton */}
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
        <CardHeader>
          <div className="flex items-start space-x-4">
            <Skeleton className="h-20 w-20 rounded-full bg-gray-700" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48 bg-gray-700" />
              <Skeleton className="h-4 w-32 bg-gray-700" />
              <Skeleton className="h-4 w-64 bg-gray-700" />
            </div>
            <Skeleton className="h-10 w-24 bg-gray-700" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="text-center space-y-1">
                <Skeleton className="h-6 w-12 mx-auto bg-gray-700" />
                <Skeleton className="h-4 w-16 mx-auto bg-gray-700" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs Skeleton */}
      <div className="flex space-x-1 bg-gray-800 rounded-lg p-1">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-24 bg-gray-700" />
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Skeleton className="h-10 w-10 rounded-full bg-gray-700" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-32 bg-gray-700" />
                  <Skeleton className="h-3 w-24 bg-gray-700" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-gray-700" />
                <Skeleton className="h-4 w-3/4 bg-gray-700" />
                <Skeleton className="h-4 w-1/2 bg-gray-700" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

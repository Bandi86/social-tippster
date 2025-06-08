'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PostDetailPageMinimal() {
  const params = useParams();
  const [postId, setPostId] = useState<string | null>(null);

  useEffect(() => {
    console.log('🔄 Effect running...');

    const resolveParams = async () => {
      try {
        const resolvedParams = await params;
        const id = resolvedParams.id as string;
        console.log('🆔 Resolved ID:', id);
        setPostId(id);
      } catch (error) {
        console.error('Error:', error);
      }
    };

    resolveParams();
  }, []); // Empty dependency array

  return (
    <div>
      <h1>Minimal Post Detail</h1>
      <p>Post ID: {postId}</p>
    </div>
  );
}

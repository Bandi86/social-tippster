'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AdminComment,
  deleteComment,
  fetchCommentById,
  toggleCommentPin,
  updateCommentStatus,
} from '@/lib/api/admin-apis/comments';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Clock,
  ExternalLink,
  Eye,
  EyeOff,
  MessageCircle,
  Pin,
  PinOff,
  ThumbsDown,
  ThumbsUp,
  Trash2,
  User,
} from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function AdminCommentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const commentId = params.id as string;

  const [comment, setComment] = useState<AdminComment | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const loadComment = async () => {
    try {
      setLoading(true);
      const commentData = await fetchCommentById(commentId);
      setComment(commentData);
    } catch (error) {
      console.error('Error loading comment:', error);
      toast.error('Failed to load comment');
      router.push('/admin/comments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (commentId) {
      loadComment();
    }
  }, [commentId]);

  const handleUpdateStatus = async (status: 'active' | 'hidden' | 'pending') => {
    if (!comment) return;

    try {
      setActionLoading(true);
      const updatedComment = await updateCommentStatus(comment.id, status);
      setComment(updatedComment);
      toast.success(
        `Comment ${status === 'active' ? 'approved' : status === 'hidden' ? 'hidden' : 'set to pending'}`,
      );
    } catch (error) {
      toast.error('Failed to update comment status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePin = async () => {
    if (!comment) return;

    try {
      setActionLoading(true);
      const updatedComment = await toggleCommentPin(comment.id);
      setComment(updatedComment);
      toast.success('Comment pin status updated');
    } catch (error) {
      toast.error('Failed to update pin status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteComment = async () => {
    if (!comment) return;

    if (!confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      await deleteComment(comment.id);
      toast.success('Comment deleted successfully');
      router.push('/admin/comments');
    } catch (error) {
      toast.error('Failed to delete comment');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant='default' className='bg-green-100 text-green-800 border-green-200'>
            <Eye className='h-3 w-3 mr-1' />
            Active
          </Badge>
        );
      case 'hidden':
        return (
          <Badge variant='secondary' className='bg-red-100 text-red-800 border-red-200'>
            <EyeOff className='h-3 w-3 mr-1' />
            Hidden
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant='outline' className='bg-yellow-100 text-yellow-800 border-yellow-200'>
            <Clock className='h-3 w-3 mr-1' />
            Pending
          </Badge>
        );
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className='flex-1 space-y-6 p-8'>
        <div className='flex items-center gap-4'>
          <Skeleton className='h-10 w-10' />
          <div className='space-y-2'>
            <Skeleton className='h-8 w-[250px]' />
            <Skeleton className='h-4 w-[200px]' />
          </div>
        </div>
        <div className='grid gap-6 md:grid-cols-2'>
          <Skeleton className='h-[400px]' />
          <Skeleton className='h-[400px]' />
        </div>
      </div>
    );
  }

  if (!comment) {
    return (
      <div className='flex-1 flex items-center justify-center p-8'>
        <div className='text-center'>
          <h2 className='text-2xl font-bold text-gray-900 dark:text-gray-100'>Comment not found</h2>
          <p className='text-gray-500 dark:text-gray-400 mt-2'>
            The comment you're looking for doesn't exist or has been removed.
          </p>
          <Link href='/admin/comments'>
            <Button className='mt-4'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Comments
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='flex-1 space-y-6 p-8'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-4'>
          <Link href='/admin/comments'>
            <Button variant='outline' size='sm'>
              <ArrowLeft className='h-4 w-4 mr-2' />
              Back to Comments
            </Button>
          </Link>
          <div>
            <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent'>
              Comment Details
            </h1>
            <p className='text-gray-500 dark:text-gray-400'>
              Manage and moderate individual comment
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className='flex items-center space-x-2'>
          {comment.status === 'active' ? (
            <Button
              variant='outline'
              onClick={() => handleUpdateStatus('hidden')}
              disabled={actionLoading}
              className='text-yellow-600 hover:bg-yellow-50 border-yellow-200'
            >
              <EyeOff className='h-4 w-4 mr-2' />
              Hide Comment
            </Button>
          ) : (
            <Button
              variant='outline'
              onClick={() => handleUpdateStatus('active')}
              disabled={actionLoading}
              className='text-green-600 hover:bg-green-50 border-green-200'
            >
              <Eye className='h-4 w-4 mr-2' />
              Approve Comment
            </Button>
          )}
          <Button
            variant='outline'
            onClick={handleTogglePin}
            disabled={actionLoading}
            className='text-blue-600 hover:bg-blue-50 border-blue-200'
          >
            {comment.is_pinned ? (
              <>
                <PinOff className='h-4 w-4 mr-2' />
                Unpin
              </>
            ) : (
              <>
                <Pin className='h-4 w-4 mr-2' />
                Pin
              </>
            )}
          </Button>
          <Button
            variant='outline'
            onClick={handleDeleteComment}
            disabled={actionLoading}
            className='text-red-600 hover:bg-red-50 border-red-200'
          >
            <Trash2 className='h-4 w-4 mr-2' />
            Delete
          </Button>
        </div>
      </div>

      <div className='grid gap-6 lg:grid-cols-2'>
        {/* Comment Content */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <CardTitle>Comment Content</CardTitle>
              <div className='flex items-center space-x-2'>
                {getStatusBadge(comment.status)}
                {comment.is_pinned && (
                  <Badge variant='secondary' className='bg-blue-100 text-blue-800 border-blue-200'>
                    <Pin className='h-3 w-3 mr-1' />
                    Pinned
                  </Badge>
                )}
                {comment.is_reported && (
                  <Badge variant='destructive'>
                    <AlertTriangle className='h-3 w-3 mr-1' />
                    Reported ({comment.reports_count})
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
              <p className='text-sm leading-relaxed whitespace-pre-wrap'>{comment.content}</p>
            </div>

            <Separator />

            {/* Engagement Stats */}
            <div className='grid grid-cols-3 gap-4'>
              <div className='text-center'>
                <div className='flex items-center justify-center space-x-1 text-green-600'>
                  <ThumbsUp className='h-4 w-4' />
                  <span className='font-semibold'>{comment.likes_count}</span>
                </div>
                <p className='text-xs text-gray-500 mt-1'>Likes</p>
              </div>
              <div className='text-center'>
                <div className='flex items-center justify-center space-x-1 text-red-600'>
                  <ThumbsDown className='h-4 w-4' />
                  <span className='font-semibold'>{comment.dislikes_count}</span>
                </div>
                <p className='text-xs text-gray-500 mt-1'>Dislikes</p>
              </div>
              <div className='text-center'>
                <div className='flex items-center justify-center space-x-1 text-blue-600'>
                  <MessageCircle className='h-4 w-4' />
                  <span className='font-semibold'>{comment.replies_count}</span>
                </div>
                <p className='text-xs text-gray-500 mt-1'>Replies</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comment Details */}
        <div className='space-y-6'>
          {/* Author Information */}
          <Card>
            <CardHeader>
              <CardTitle>Author Information</CardTitle>
              <CardDescription>Details about the comment author</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='flex items-center space-x-3'>
                <div className='h-10 w-10 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center'>
                  <span className='text-white font-semibold'>
                    {comment.author.username[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className='font-semibold'>{comment.author.username}</p>
                  <p className='text-sm text-gray-500'>{comment.author.email}</p>
                </div>
              </div>

              <Separator />

              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-500'>Role:</span>
                  <Badge variant={comment.author.role === 'admin' ? 'default' : 'secondary'}>
                    {comment.author.role}
                  </Badge>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm text-gray-500'>Status:</span>
                  {comment.author.is_banned ? (
                    <Badge variant='destructive'>Banned</Badge>
                  ) : (
                    <Badge variant='default' className='bg-green-100 text-green-800'>
                      Active
                    </Badge>
                  )}
                </div>
              </div>

              <Link href={`/admin/users?search=${comment.author.username}`}>
                <Button variant='outline' size='sm' className='w-full'>
                  <User className='h-4 w-4 mr-2' />
                  View User Profile
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Post Information */}
          <Card>
            <CardHeader>
              <CardTitle>Related Post</CardTitle>
              <CardDescription>Post this comment belongs to</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div>
                <h4 className='font-semibold line-clamp-2'>{comment.post.title}</h4>
                <p className='text-sm text-gray-500 mt-1'>by {comment.post.author_username}</p>
              </div>

              <Badge variant='outline' className='text-xs'>
                {comment.post.type.toUpperCase()}
              </Badge>

              <div className='flex space-x-2'>
                <Link href={`/posts/${comment.post.id}`} className='flex-1'>
                  <Button variant='outline' size='sm' className='w-full'>
                    <ExternalLink className='h-4 w-4 mr-2' />
                    View Post
                  </Button>
                </Link>
                <Link href={`/admin/posts?search=${comment.post.title}`} className='flex-1'>
                  <Button variant='outline' size='sm' className='w-full'>
                    Manage Post
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Timestamps */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>Comment creation and modification dates</CardDescription>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-500'>Created:</span>
                <div className='flex items-center text-sm'>
                  <Calendar className='h-4 w-4 mr-1 text-gray-400' />
                  {new Date(comment.created_at).toLocaleString()}
                </div>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-500'>Updated:</span>
                <div className='flex items-center text-sm'>
                  <Calendar className='h-4 w-4 mr-1 text-gray-400' />
                  {new Date(comment.updated_at).toLocaleString()}
                </div>
              </div>
              {comment.deleted_at && (
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-gray-500'>Deleted:</span>
                  <div className='flex items-center text-sm text-red-600'>
                    <Calendar className='h-4 w-4 mr-1' />
                    {new Date(comment.deleted_at).toLocaleString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

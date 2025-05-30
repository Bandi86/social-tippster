'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useComments } from '@/hooks/useComments';
import {
  AlertTriangle,
  Eye,
  EyeOff,
  Heart,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  Pin,
  PinOff,
  RefreshCw,
  Search,
  ThumbsUp,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface CommentsStats {
  total: number;
  active: number;
  hidden: number;
  pending: number;
  reported: number;
  pinned: number;
  totalLikes: number;
  recentComments: number;
}

export default function AdminCommentsPage() {
  const {
    // Admin data
    adminComments: comments,
    commentsStats: stats,

    // Admin pagination and filters
    adminPagination,
    adminFilters,

    // Admin UI state
    isLoadingAdminComments: loading,

    // Admin actions
    fetchAdminComments,
    fetchCommentsStats,
    deleteComment,
    updateCommentStatus,
    toggleCommentPin,
    bulkDeleteComments,
    bulkUpdateCommentsStatus,
    setAdminPage,
    setAdminFilters,
  } = useComments();

  const [selectedComments, setSelectedComments] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const router = useRouter();

  const commentsPerPage = 20;

  // Extract values from pagination object
  const currentPage = adminPagination.page;
  const totalComments = adminPagination.total;
  const totalPages = adminPagination.totalPages;

  // Extract values from filters object
  const searchTerm = adminFilters.search;
  const statusFilter = adminFilters.status;
  const sortBy = adminFilters.sort;

  const loadComments = async () => {
    try {
      const filters = {
        search: searchTerm || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        sort: sortBy as any,
        page: currentPage,
        limit: commentsPerPage,
      };

      await fetchAdminComments(filters);
      await fetchCommentsStats();
    } catch (error) {
      console.error('Error loading comments:', error);
      toast.error('Failed to load comments');
    }
  };

  useEffect(() => {
    loadComments();
  }, [currentPage, statusFilter, sortBy]);

  const handleSearch = () => {
    setAdminPage(1);
    loadComments();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleDeleteComment = async (id: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await deleteComment(id);
      toast.success('Comment deleted successfully');
      await loadComments();
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const handleUpdateStatus = async (id: string, status: 'active' | 'hidden' | 'pending') => {
    try {
      await updateCommentStatus(id, status);
      toast.success(
        `Comment ${status === 'active' ? 'approved' : status === 'hidden' ? 'hidden' : 'set to pending'}`,
      );
      await loadComments();
    } catch (error) {
      toast.error('Failed to update comment status');
    }
  };

  const handleTogglePin = async (id: string) => {
    try {
      await toggleCommentPin(id);
      toast.success('Comment pin status updated');
      await loadComments();
    } catch (error) {
      toast.error('Failed to update pin status');
    }
  };

  const handleSelectComment = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedComments([...selectedComments, id]);
    } else {
      setSelectedComments(selectedComments.filter(cId => cId !== id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedComments(comments.map(c => c.id));
    } else {
      setSelectedComments([]);
    }
  };

  const handleBulkAction = async (action: 'delete' | 'hide' | 'approve') => {
    if (selectedComments.length === 0) {
      toast.error('Please select comments first');
      return;
    }

    const confirmMessage = `Are you sure you want to ${action} ${selectedComments.length} comment${
      selectedComments.length > 1 ? 's' : ''
    }?`;

    if (!confirm(confirmMessage)) return;

    try {
      setBulkActionLoading(true);

      if (action === 'delete') {
        await bulkDeleteComments(selectedComments);
        toast.success(`${selectedComments.length} comments deleted`);
      } else {
        const status = action === 'approve' ? 'active' : 'hidden';
        await bulkUpdateCommentsStatus(selectedComments, status);
        toast.success(`${selectedComments.length} comments ${action}d`);
      }

      setSelectedComments([]);
      await loadComments();
    } catch (error) {
      toast.error(`Failed to ${action} comments`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant='default' className='bg-green-100 text-green-800'>
            Active
          </Badge>
        );
      case 'hidden':
        return (
          <Badge variant='secondary' className='bg-red-100 text-red-800'>
            Hidden
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant='outline' className='bg-yellow-100 text-yellow-800'>
            Pending
          </Badge>
        );
      default:
        return <Badge variant='outline'>{status}</Badge>;
    }
  };

  if (loading && !comments.length) {
    return (
      <div className='flex-1 space-y-6 p-8'>
        <div className='space-y-2'>
          <Skeleton className='h-8 w-[200px]' />
          <Skeleton className='h-4 w-[300px]' />
        </div>
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-[125px]' />
          ))}
        </div>
        <Skeleton className='h-[400px]' />
      </div>
    );
  }

  return (
    <div className='flex-1 space-y-6 p-8'>
      {/* Header */}
      <div className='space-y-2'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-600 to-amber-500 bg-clip-text text-transparent'>
              Comments Management
            </h1>
            <p className='text-gray-500 dark:text-gray-400'>
              Moderate and manage user comments across all posts
            </p>
          </div>
          <Button onClick={loadComments} variant='outline' disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card className='bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/30 border-blue-200 dark:border-blue-800'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-blue-700 dark:text-blue-300'>
                Total Comments
              </CardTitle>
              <MessageSquare className='h-4 w-4 text-blue-600 dark:text-blue-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-blue-800 dark:text-blue-200'>
                {stats.total}
              </div>
              <p className='text-xs text-blue-600 dark:text-blue-400'>
                +{stats.recentComments} this week
              </p>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/30 border-green-200 dark:border-green-800'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-green-700 dark:text-green-300'>
                Active Comments
              </CardTitle>
              <MessageCircle className='h-4 w-4 text-green-600 dark:text-green-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-green-800 dark:text-green-200'>
                {stats.active}
              </div>
              <p className='text-xs text-green-600 dark:text-green-400'>
                {((stats.active / stats.total) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/30 border-red-200 dark:border-red-800'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-red-700 dark:text-red-300'>
                Reported Comments
              </CardTitle>
              <AlertTriangle className='h-4 w-4 text-red-600 dark:text-red-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-red-800 dark:text-red-200'>
                {stats.reported}
              </div>
              <p className='text-xs text-red-600 dark:text-red-400'>Need moderation</p>
            </CardContent>
          </Card>

          <Card className='bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/30 border-purple-200 dark:border-purple-800'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-purple-700 dark:text-purple-300'>
                Total Likes
              </CardTitle>
              <ThumbsUp className='h-4 w-4 text-purple-600 dark:text-purple-400' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold text-purple-800 dark:text-purple-200'>
                {stats.totalLikes}
              </div>
              <p className='text-xs text-purple-600 dark:text-purple-400'>
                {stats.pinned} pinned comments
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Comments</CardTitle>
          <CardDescription>Search and filter comments by status, content, and more</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col md:flex-row gap-4'>
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                <Input
                  placeholder='Search comments, authors, or posts...'
                  value={searchTerm}
                  onChange={e => setAdminFilters({ search: e.target.value })}
                  onKeyPress={handleKeyPress}
                  className='pl-10'
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onValueChange={value => setAdminFilters({ status: value })}
            >
              <SelectTrigger className='w-[140px]'>
                <SelectValue placeholder='Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>All Status</SelectItem>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='hidden'>Hidden</SelectItem>
                <SelectItem value='pending'>Pending</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={value => setAdminFilters({ sort: value as any })}>
              <SelectTrigger className='w-[140px]'>
                <SelectValue placeholder='Sort by' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='newest'>Newest</SelectItem>
                <SelectItem value='oldest'>Oldest</SelectItem>
                <SelectItem value='most_liked'>Most Liked</SelectItem>
                <SelectItem value='most_reported'>Most Reported</SelectItem>
                <SelectItem value='most_replies'>Most Replies</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleSearch} disabled={loading}>
              <Search className='h-4 w-4 mr-2' />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedComments.length > 0 && (
        <Card className='border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20'>
          <CardContent className='pt-6'>
            <div className='flex items-center justify-between'>
              <span className='text-sm font-medium'>
                {selectedComments.length} comment{selectedComments.length > 1 ? 's' : ''} selected
              </span>
              <div className='flex gap-2'>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => handleBulkAction('approve')}
                  disabled={bulkActionLoading}
                  className='text-green-600 hover:bg-green-50 border-green-200'
                >
                  <Eye className='h-4 w-4 mr-1' />
                  Approve
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => handleBulkAction('hide')}
                  disabled={bulkActionLoading}
                  className='text-yellow-600 hover:bg-yellow-50 border-yellow-200'
                >
                  <EyeOff className='h-4 w-4 mr-1' />
                  Hide
                </Button>
                <Button
                  size='sm'
                  variant='outline'
                  onClick={() => handleBulkAction('delete')}
                  disabled={bulkActionLoading}
                  className='text-red-600 hover:bg-red-50 border-red-200'
                >
                  <Trash2 className='h-4 w-4 mr-1' />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comments ({totalComments})</CardTitle>
          <CardDescription>Manage and moderate user comments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[50px]'>
                    <Checkbox
                      checked={selectedComments.length === comments.length && comments.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Post</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Engagement</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className='text-right'>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comments.map(comment => (
                  <TableRow key={comment.id} className='hover:bg-gray-50 dark:hover:bg-gray-800/50'>
                    <TableCell>
                      <Checkbox
                        checked={selectedComments.includes(comment.id)}
                        onCheckedChange={checked =>
                          handleSelectComment(comment.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell className='max-w-md'>
                      <div className='space-y-1'>
                        <p className='text-sm line-clamp-2'>{comment.content}</p>
                        <div className='flex gap-2'>
                          {comment.is_reported && (
                            <Badge variant='destructive' className='text-xs'>
                              <AlertTriangle className='h-3 w-3 mr-1' />
                              Reported ({comment.reports_count})
                            </Badge>
                          )}
                          {comment.is_pinned && (
                            <Badge variant='secondary' className='text-xs'>
                              <Pin className='h-3 w-3 mr-1' />
                              Pinned
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='flex items-center space-x-2'>
                        <div>
                          <p className='text-sm font-medium'>{comment.author.username}</p>
                          <p className='text-xs text-gray-500'>{comment.author.role}</p>
                          {comment.author.is_banned && (
                            <Badge variant='destructive' className='text-xs mt-1'>
                              Banned
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Link
                          href={`/posts/${comment.post.id}`}
                          className='text-sm font-medium hover:text-amber-600 line-clamp-1'
                        >
                          {comment.post.title}
                        </Link>
                        <p className='text-xs text-gray-500'>by {comment.post.author_username}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(comment.status)}</TableCell>
                    <TableCell>
                      <div className='flex items-center space-x-3 text-sm text-gray-500'>
                        <span className='flex items-center'>
                          <Heart className='h-3 w-3 mr-1' />
                          {comment.likes_count}
                        </span>
                        <span className='flex items-center'>
                          <MessageCircle className='h-3 w-3 mr-1' />
                          {comment.replies_count}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className='text-sm text-gray-500'>
                        {new Date(comment.created_at).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className='text-right'>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' className='h-8 w-8 p-0'>
                            <MoreHorizontal className='h-4 w-4' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end' className='w-48'>
                          {comment.status === 'active' ? (
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(comment.id, 'hidden')}
                            >
                              <EyeOff className='mr-2 h-4 w-4' />
                              Hide Comment
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(comment.id, 'active')}
                            >
                              <Eye className='mr-2 h-4 w-4' />
                              Approve Comment
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem onClick={() => handleTogglePin(comment.id)}>
                            {comment.is_pinned ? (
                              <>
                                <PinOff className='mr-2 h-4 w-4' />
                                Unpin Comment
                              </>
                            ) : (
                              <>
                                <Pin className='mr-2 h-4 w-4' />
                                Pin Comment
                              </>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => handleDeleteComment(comment.id)}
                            className='text-red-600 focus:text-red-600'
                          >
                            <Trash2 className='mr-2 h-4 w-4' />
                            Delete Comment
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className='flex items-center justify-between space-x-2 py-4'>
              <div className='text-sm text-gray-500'>
                Showing {(currentPage - 1) * commentsPerPage + 1} to{' '}
                {Math.min(currentPage * commentsPerPage, totalComments)} of {totalComments} comments
              </div>
              <div className='flex space-x-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setAdminPage(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  Previous
                </Button>
                <div className='flex items-center space-x-1'>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + Math.max(1, currentPage - 2);
                    if (page > totalPages) return null;
                    return (
                      <Button
                        key={page}
                        variant={page === currentPage ? 'default' : 'outline'}
                        size='sm'
                        onClick={() => setAdminPage(page)}
                        disabled={loading}
                        className='w-8 h-8 p-0'
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setAdminPage(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

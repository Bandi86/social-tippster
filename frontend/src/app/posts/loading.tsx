export default function PostsLoading() {
  return (
    <div className='flex flex-col min-h-screen'>
      {/* Navbar skeleton */}
      <div className='bg-white shadow-sm'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between h-16 items-center'>
            <div className='h-6 bg-gray-200 rounded w-32 animate-pulse'></div>
            <div className='flex space-x-4'>
              <div className='h-8 bg-gray-200 rounded w-16 animate-pulse'></div>
              <div className='h-8 bg-gray-200 rounded w-20 animate-pulse'></div>
            </div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <main className='flex-grow'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='flex items-center justify-between mb-8'>
            <div>
              <div className='h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse'></div>
              <div className='h-4 bg-gray-200 rounded w-80 animate-pulse'></div>
            </div>
            <div className='h-10 bg-gray-200 rounded w-28 animate-pulse'></div>
          </div>

          <div className='space-y-6'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='bg-white rounded-lg shadow-sm border p-6 animate-pulse'>
                <div className='h-6 bg-gray-200 rounded w-3/4 mb-3'></div>
                <div className='h-4 bg-gray-200 rounded w-1/2 mb-4'></div>
                <div className='space-y-2 mb-4'>
                  <div className='h-4 bg-gray-200 rounded'></div>
                  <div className='h-4 bg-gray-200 rounded w-5/6'></div>
                  <div className='h-4 bg-gray-200 rounded w-4/6'></div>
                </div>
                <div className='h-4 bg-gray-200 rounded w-24'></div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

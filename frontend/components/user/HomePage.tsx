const HomePage = () => {
  return (
    <main className='min-h-[80vh] flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-100 text-slate-800 font-sans p-8'>
      <h1 className='text-4xl font-bold mb-4 text-blue-600'>Welcome to Social Tippster!</h1>
      <p className='text-lg max-w-xl text-center mb-8 text-slate-700'>
        Discover, share, and discuss the best tips with a vibrant community. Join us and make your
        voice heard!
      </p>
      <a
        href='#'
        className='bg-gradient-to-r from-indigo-500 to-blue-500 text-white py-3 px-8 rounded-full font-semibold text-lg no-underline shadow-md transition-all duration-200 hover:from-blue-500 hover:to-indigo-500'
      >
        Get Started
      </a>
    </main>
  );
};

export default HomePage;

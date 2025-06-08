'use client';

/**
 * Magyar: Poszt meta indikátorok komponens
 * Post meta indicators component - displays image indicator and other meta info
 * Temporarily disabled to hide image indicator.
 */
export default function PostMetaIndicators() {
  // Temporarily disable rendering of this component to remove the image icon/text
  return null;

  // Original logic below, commented out:
  // if (!showImageIndicator) {
  //   return null;
  // }

  // return (
  //   <div className={`flex items-center gap-1 ${className || ''}`}>
  //     <span>•</span>
  //     <div className='flex items-center gap-1 text-blue-400'>
  //       <Image className='h-3 w-3' />
  //       <span className='text-xs'>Kép</span>
  //     </div>
  //   </div>
  // );
}

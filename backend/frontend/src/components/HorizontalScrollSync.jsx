import React, { useEffect, useRef, useState } from 'react';

const HorizontalScrollSync = ({ children, containerId }) => {
  const scrollContainerRef = useRef(null);
  const scrollSpacerRef = useRef(null);
  const mainContainerRef = useRef(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    const scrollSpacer = scrollSpacerRef.current;
    const mainContainer = mainContainerRef.current;

    if (scrollContainer && scrollSpacer && mainContainer) {
      // Match spacer width to main container scroll width
      const updateSpacerWidth = () => {
        // Get the actual table width from the first table element
        const table = mainContainer.querySelector('table');
        if (table) {
          const tableWidth = table.offsetWidth;
          const containerWidth = mainContainer.offsetWidth;
          const scrollWidth = Math.max(tableWidth, containerWidth);
          
          scrollSpacer.style.width = scrollWidth + 'px';
          
          // Ensure both containers have the same scroll width
          scrollContainer.scrollLeft = mainContainer.scrollLeft;
        }
      };

      // Initial setup with delay to ensure DOM is ready
      const initializeScroll = () => {
        setTimeout(() => {
          updateSpacerWidth();
          setIsInitialized(true);
        }, 100);
      };

      initializeScroll();

      // Handle top scroll
      const handleTopScroll = () => {
        mainContainer.scrollLeft = scrollContainer.scrollLeft;
      };

      // Handle main scroll
      const handleMainScroll = () => {
        scrollContainer.scrollLeft = mainContainer.scrollLeft;
      };

      // Add event listeners
      scrollContainer.addEventListener('scroll', handleTopScroll);
      mainContainer.addEventListener('scroll', handleMainScroll);

      // Update spacer width on window resize and after content changes
      const handleResize = () => {
        updateSpacerWidth();
      };

      // Also update on DOM changes (for dynamic content)
      const observer = new MutationObserver(() => {
        setTimeout(updateSpacerWidth, 50);
      });

      observer.observe(mainContainer, {
        childList: true,
        subtree: true,
        attributes: true,
        characterData: true
      });

      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => {
        scrollContainer.removeEventListener('scroll', handleTopScroll);
        mainContainer.removeEventListener('scroll', handleMainScroll);
        window.removeEventListener('resize', handleResize);
        observer.disconnect();
      };
    }
  }, []);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Top scrollbar mirror */}
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto w-full border-b border-gray-200 bg-gray-50"
        style={{ height: '12px' }}
      >
        <div 
          ref={scrollSpacerRef} 
          style={{ 
            height: '1px',
            minWidth: '100%',
            width: '2000px' // Fallback width
          }}
        ></div>
      </div>
      
      {/* Main content container */}
      <div ref={mainContainerRef} className="overflow-x-auto w-full" id={containerId}>
        {children}
      </div>
    </div>
  );
};

export default HorizontalScrollSync;

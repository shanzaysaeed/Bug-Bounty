/**
 * Utility functions for managing scroll in the application
 */

/**
 * Resets scroll to top
 */
export const scrollToTop = (): void => {
  const mainContentArea = document.getElementById('main-content-area');
  if (mainContentArea) {
    mainContentArea.scrollTop = 0;
  } else {
    window.scrollTo(0, 0);
  }
};
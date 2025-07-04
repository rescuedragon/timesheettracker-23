
// Generate consistent, soft colors for projects
export const generateProjectColor = (projectName: string): string => {
  // Create a simple hash from the project name
  let hash = 0;
  for (let i = 0; i < projectName.length; i++) {
    const char = projectName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use the hash to select from a predefined set of soft, eye-friendly colors
  const softColors = [
    'rgba(255, 235, 235, 0.7)', // Soft red
    'rgba(235, 255, 235, 0.7)', // Soft green  
    'rgba(235, 235, 255, 0.7)', // Soft blue
    'rgba(255, 255, 235, 0.7)', // Soft yellow
    'rgba(255, 235, 255, 0.7)', // Soft magenta
    'rgba(235, 255, 255, 0.7)', // Soft cyan
    'rgba(255, 245, 235, 0.7)', // Soft orange
    'rgba(245, 235, 255, 0.7)', // Soft purple
    'rgba(240, 248, 255, 0.7)', // Soft alice blue
    'rgba(255, 248, 240, 0.7)', // Soft cornsilk
    'rgba(240, 255, 240, 0.7)', // Soft honeydew
    'rgba(255, 240, 245, 0.7)', // Soft lavender blush
  ];
  
  const index = Math.abs(hash) % softColors.length;
  return softColors[index];
};

export const isColorCodedProjectsEnabled = (): boolean => {
  const saved = localStorage.getItem('color-coded-projects-enabled');
  return saved ? JSON.parse(saved) : false;
};

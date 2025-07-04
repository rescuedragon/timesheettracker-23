
// Generate consistent, unique colors for projects
export const generateProjectColor = (projectName: string): string => {
  // Create a simple hash from the project name
  let hash = 0;
  for (let i = 0; i < projectName.length; i++) {
    const char = projectName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Get existing project colors from localStorage to avoid duplicates
  const existingColors = getExistingProjectColors();
  
  // Extended set of soft, eye-friendly colors for better uniqueness
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
    'rgba(255, 228, 225, 0.7)', // Soft misty rose
    'rgba(230, 230, 250, 0.7)', // Soft lavender
    'rgba(255, 250, 205, 0.7)', // Soft lemon chiffon
    'rgba(240, 255, 255, 0.7)', // Soft azure
    'rgba(255, 239, 213, 0.7)', // Soft papaya whip
    'rgba(245, 255, 250, 0.7)', // Soft mint cream
    'rgba(253, 245, 230, 0.7)', // Soft old lace
    'rgba(255, 218, 185, 0.7)', // Soft peach puff
  ];
  
  // Check if this project already has a color assigned
  const existingColor = existingColors[projectName];
  if (existingColor) {
    return existingColor;
  }
  
  // Find an unused color
  const usedColors = Object.values(existingColors);
  const availableColors = softColors.filter(color => !usedColors.includes(color));
  
  let selectedColor;
  if (availableColors.length > 0) {
    // Use hash to select from available colors
    const index = Math.abs(hash) % availableColors.length;
    selectedColor = availableColors[index];
  } else {
    // If all colors are used, fall back to hash-based selection
    const index = Math.abs(hash) % softColors.length;
    selectedColor = softColors[index];
  }
  
  // Store the color assignment
  const updatedColors = { ...existingColors, [projectName]: selectedColor };
  localStorage.setItem('project-colors', JSON.stringify(updatedColors));
  
  return selectedColor;
};

const getExistingProjectColors = (): Record<string, string> => {
  const saved = localStorage.getItem('project-colors');
  return saved ? JSON.parse(saved) : {};
};

export const isColorCodedProjectsEnabled = (): boolean => {
  const saved = localStorage.getItem('color-coded-projects-enabled');
  return saved ? JSON.parse(saved) : false;
};

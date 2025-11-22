import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filenam

// Function to convert BlockShowcase to static components
function convertBlockShowcase(content) {
  // Replace BlockShowcase patterns with direct component usage
  return content.replace(
    /:BlockShowcase\{([^}]+)\}/g,
    (match, props) => {
      // Extract component name from props
      const componentMatch = props.match(/component="([^"]+)"/);
      if (componentMatch) {
        const componentName = componentMatch[1];
        
        // Extract other props
        const containerClassMatch = props.match(/containerClass="([^"]+)"/);
        const iframeHeightMatch = props.match(/iframeHeight="([^"]+)"/);
        
        let className = '';
        if (containerClassMatch) {
          className = ` class="${containerClassMatch[1]}"`;
        }
        
        let style = '';
        if (iframeHeightMatch) {
          style = ` style="height: ${iframeHeightMatch[1]}"`;
        }
        
        return `<${componentName}${className}${style} />`;
      }
      return match; // Keep original if no component found
    }
  );
}

// Function to process all block files
function convertAllBlocks() {
  const blocksDir = path.join(__dirname, '../content/6.blocks');
  const files = fs.readdirSync(blocksDir);
  
  files.forEach(file => {
    if (file.endsWith('.md') && file !== '.navigation.yml') {
      const filePath = path.join(blocksDir, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Convert the content
      const convertedContent = convertBlockShowcase(content);
      
      // Write back to file
      fs.writeFileSync(filePath, convertedContent);
      
      console.log(`Converted: ${file}`);
    }
  });
  
  console.log('All blocks converted to static components!');
}

// Run the conversion
convertAllBlocks();

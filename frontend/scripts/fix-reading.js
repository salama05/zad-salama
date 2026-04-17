const fs = require('fs');

const fixSwipe = (filePath) => {
  let cnt = fs.readFileSync(filePath, 'utf8');
  
  // Fix arrows
  cnt = cnt.replace(/case 'ArrowLeft':\s*prevPage\(\);\s*break;\s*case 'ArrowRight':\s*nextPage\(\);\s*break;/, "case 'ArrowLeft':\n            nextPage();\n            break;\n          case 'ArrowRight':\n            prevPage();\n            break;");
  
  // Fix swipe Left (diff > 0 is left swipe). It should be NEXT.
  cnt = cnt.replace(/if \(diff > 0\)\s*\{\s*\/\/[^\n]*\n\s*prevPage\(\);\s*\}\s*else\s*\{\s*\/\/[^\n]*\n\s*nextPage\(\);\s*\}/, "if (diff > 0) {\n          // Swipe Left -> Next Page\n          nextPage();\n        } else {\n          // Swipe Right -> Prev Page\n          prevPage();\n        }");
  
  // Also check SurahDetail
  cnt = cnt.replace(/if \(diff > 0\)\s*\{\s*\/\/[^\n]*\n\s*goToPrevPage\(\);\s*\}\s*else\s*\{\s*\/\/[^\n]*\n\s*goToNextPage\(\);\s*\}/, "if (diff > 0) {\n          goToNextPage();\n        } else {\n          goToPrevPage();\n        }");

  fs.writeFileSync(filePath, cnt);
  console.log('Fixed', filePath);
};

fixSwipe('d:/1- my projects 2026/zad salama/frontend/src/pages/MushafReader.jsx');
if (fs.existsSync('d:/1- my projects 2026/zad salama/frontend/src/pages/SurahDetail.jsx')) {
  fixSwipe('d:/1- my projects 2026/zad salama/frontend/src/pages/SurahDetail.jsx');
}

const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'client', 'src', 'pages');

const replacements = [
  { regex: /import\s+['"].*\.css['"];?\n/g, replacement: '' }, // Remove css imports
  { regex: /className="([^"]*)card([^"]*)"/g, replacement: 'className="$1glass-card$2"' },
  { regex: /var\(--color-bg\)/g, replacement: '#0f172a' },
  { regex: /var\(--color-primary-light\)/g, replacement: '#818cf8' },
  { regex: /var\(--color-primary\)/g, replacement: '#6366f1' },
  { regex: /var\(--color-text-secondary\)/g, replacement: '#94a3b8' },
  { regex: /var\(--color-text\)/g, replacement: '#f8fafc' },
  { regex: /var\(--color-border\)/g, replacement: 'rgba(255,255,255,0.1)' },
  { regex: /var\(--color-accent-positive\)/g, replacement: '#34d399' },
  { regex: /var\(--color-accent-negative\)/g, replacement: '#f87171' },
  { regex: /#E8F5E9/g, replacement: 'rgba(16, 185, 129, 0.1)' },
  { regex: /#FDF2F2/g, replacement: 'rgba(239, 68, 68, 0.1)' },
  { regex: /#F8FAFC/g, replacement: 'rgba(255, 255, 255, 0.05)' },
  { regex: /#F8F9FA/g, replacement: 'rgba(255, 255, 255, 0.05)' },
  { regex: /#C8E6C9/g, replacement: 'rgba(16, 185, 129, 0.2)' },
  { regex: /#F8D7DA/g, replacement: 'rgba(239, 68, 68, 0.2)' },
  { regex: /btn btn-primary/g, replacement: 'btn-primary' },
  { regex: /btn btn-secondary/g, replacement: 'btn-secondary' },
  { regex: /btn-danger/g, replacement: 'alert-error' },
  { regex: /custom-table/g, replacement: 'w-full text-left border-collapse [&_th]:p-3 [&_th]:border-b [&_th]:border-white/10 [&_th]:text-slate-400 [&_th]:font-semibold [&_td]:p-3 [&_td]:border-b [&_td]:border-white/5' },
  { regex: /form-input/g, replacement: 'input-field' },
  { regex: /form-label/g, replacement: 'block text-sm font-medium text-slate-300 mb-1.5' },
  { regex: /form-group/g, replacement: 'mb-4' },
];

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.jsx') && !fullPath.includes('LoginPage') && !fullPath.includes('RegisterPage')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      for (const r of replacements) {
        content = content.replace(r.regex, r.replacement);
      }
      
      fs.writeFileSync(fullPath, content);
      console.log(`Updated ${fullPath}`);
    }
  }
}

processDirectory(pagesDir);
console.log('Bulk refactoring complete.');

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ClipboardCopy, 
  Check, 
  Globe, 
  Filter, 
  Link as LinkIcon, 
  Trash2, 
  Search,
  Settings,
  ShieldCheck,
  Code,
  Menu,
  X
} from 'lucide-react';
import { extractDomains, filterByDomains } from './lib/processor';

// --- Shared Components ---

interface BoxProps {
  index: string;
  label: string;
  value: string;
  onChange?: (val: string) => void;
  placeholder?: string;
  readOnly?: boolean;
  onCopy?: () => void;
  onClear?: () => void;
}

function ColumnBox({ index, label, value, onChange, placeholder, readOnly, onCopy, onClear }: BoxProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    onCopy?.();
  };

  return (
    <div className="flex flex-col h-[300px] md:h-full gap-3 overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="column-label">
          {index}. {label}
        </span>
        <div className="flex gap-2">
          {onClear && !readOnly && value && (
            <button onClick={onClear} className="text-text-muted hover:text-red-500 transition-colors cursor-pointer p-1">
              <Trash2 size={14} />
            </button>
          )}
          {value && (
             <button onClick={handleCopy} className={`transition-colors cursor-pointer p-1 ${copied ? 'text-success' : 'text-text-muted hover:text-accent'}`}>
               {copied ? <Check size={14} /> : <ClipboardCopy size={14} />}
             </button>
          )}
        </div>
      </div>
      <div className="relative flex-1 flex flex-col">
        <textarea
          className={`text-box h-full ${readOnly ? 'bg-slate-50 border-dashed' : ''}`}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          readOnly={readOnly}
          spellCheck={false}
        />
        {value && (
          <div className="absolute bottom-3 right-3 text-[9px] font-mono text-text-muted/50 uppercase tracking-tighter bg-white/50 px-1 rounded transition-opacity pointer-events-none">
            {value.split('\n').filter(l => l.trim()).length} Items
          </div>
        )}
      </div>
    </div>
  );
}

// --- Main App Component ---

type Feature = 'extractor' | 'matcher' | 'cleanup' | 'settings';

export default function App() {
  const [activeFeature, setActiveFeature] = useState<Feature>('extractor');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Feature 1 State
  const [f1Input, setF1Input] = useState('');
  const f1Output = useMemo(() => extractDomains(f1Input).join('\n'), [f1Input]);

  // Feature 2 State
  const [f2Urls, setF2Urls] = useState('');
  const [f2Domains, setF2Domains] = useState('');
  const [f2Output, setF2Output] = useState('');
  const [lastAction, setLastAction] = useState<string | null>(null);

  const handleFilter = (mode: 'include' | 'exclude') => {
    const urls = f2Urls.split(/\n|,/).map(u => u.trim()).filter(Boolean);
    const domains = f2Domains.split(/\n|,/).map(d => d.trim()).filter(Boolean);
    const result = filterByDomains(urls, domains, mode);
    setF2Output(result.join('\n'));
    setLastAction(mode === 'include' ? 'Matched Instances' : 'Filtered Instances');
  };

  const clearAll = () => {
    if (activeFeature === 'extractor') {
      setF1Input('');
    } else {
      setF2Urls('');
      setF2Domains('');
      setF2Output('');
      setLastAction(null);
    }
  };

  const navItems = [
    { id: 'extractor', label: 'Domain Extractor', icon: <LinkIcon size={16} /> },
    { id: 'matcher', label: 'Cross-Match Filter', icon: <Globe size={16} /> },
    { id: 'cleanup', label: 'Bulk Clean-up', icon: <Trash2 size={16} /> },
    { id: 'settings', label: 'API Settings', icon: <Settings size={16} /> },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-bg overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-sidebar-bg border-b border-border z-50">
        <div className="font-extrabold text-[1.1rem] tracking-tighter text-accent flex items-center gap-2">
          <Globe size={18} className="text-accent" />
          DOMAINFLY
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-text-main hover:bg-slate-100 rounded-lg transition-colors"
        >
          {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 w-[240px] bg-sidebar-bg border-r border-border flex flex-col p-6 z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="hidden md:flex font-extrabold text-[1.2rem] tracking-tighter text-accent mb-12 items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-white scale-90">
             <Globe size={18} />
          </div>
          DOMAINFLY
        </div>
        
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                setActiveFeature(item.id as Feature);
                setIsSidebarOpen(false);
              }}
              className={`nav-item ${activeFeature === item.id ? 'active' : ''}`}
            >
              <span className="mr-3 opacity-80">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-border space-y-4">
           <div className="flex items-center gap-3 text-text-muted">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                 <ShieldCheck size={14} />
              </div>
              <div className="text-[10px] uppercase font-bold tracking-widest leading-tight">
                 Auth Secure<br/>
                 <span className="text-accent">Verification V2</span>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col p-4 md:p-8 overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 md:mb-8 gap-4">
          <div>
            <span className="status-badge">Smart Auto-Fix Active</span>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight mt-1 md:mt-2 text-text-main">
              {activeFeature === 'extractor' ? 'Bulk Domain Extractor' : 'Domain Cross-Matcher'}
            </h1>
          </div>
          <button 
            onClick={clearAll}
            className="btn btn-secondary px-4 py-2 text-xs w-full sm:w-auto"
          >
            Clear All
          </button>
        </div>

        <section className="flex-1 min-h-0 overflow-y-auto pr-1">
          <AnimatePresence mode="wait">
            {activeFeature === 'extractor' ? (
              <motion.div
                key="extractor"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="grid grid-cols-1 md:grid-cols-2 h-full gap-6 md:gap-5"
              >
                <ColumnBox 
                  index="01"
                  label="List of URLs"
                  value={f1Input}
                  onChange={setF1Input}
                  placeholder="Paste multi-format URLs here..."
                  onClear={() => setF1Input('')}
                />
                <ColumnBox 
                  index="02"
                  label="Extracted Domains"
                  value={f1Output}
                  readOnly
                  placeholder="Resulting list will appear here..."
                />
              </motion.div>
            ) : activeFeature === 'matcher' ? (
              <motion.div
                key="matcher"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col h-full gap-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 flex-1 gap-6 md:gap-5">
                  <ColumnBox 
                    index="01"
                    label="Source List"
                    value={f2Urls}
                    onChange={setF2Urls}
                    placeholder="URLs or domains to filter..."
                    onClear={() => setF2Urls('')}
                  />
                  <ColumnBox 
                    index="02"
                    label="Target Domains"
                    value={f2Domains}
                    onChange={setF2Domains}
                    placeholder="Domains to match against..."
                    onClear={() => setF2Domains('')}
                  />
                  <div className="md:col-span-2 lg:col-span-1">
                    <ColumnBox 
                      index="03"
                      label={lastAction || "Matched Results"}
                      value={f2Output}
                      readOnly
                      placeholder="Results table..."
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4 border-t border-border">
                  <button
                    onClick={() => handleFilter('include')}
                    disabled={!f2Urls || !f2Domains}
                    className="btn btn-primary w-full sm:w-auto shadow-sm"
                  >
                    Filter Out Domains
                  </button>
                  <button
                    onClick={() => handleFilter('exclude')}
                    disabled={!f2Urls || !f2Domains}
                    className="btn btn-primary w-full sm:w-auto shadow-sm"
                  >
                    Filter Out URLs
                  </button>
                  <button
                    disabled={!f2Output}
                    onClick={() => {
                      navigator.clipboard.writeText(f2Output);
                      alert('Copied to clipboard!');
                    }}
                    className="btn btn-success w-full sm:w-auto shadow-sm"
                  >
                    Copy Result
                  </button>
                </div>
              </motion.div>
            ) : (
               <motion.div 
                 key="placeholder"
                 className="flex flex-col items-center justify-center p-12 h-full text-text-muted opacity-40 text-center"
               >
                 <Code size={48} className="mb-4" />
                 <p className="font-bold uppercase tracking-[0.2em] text-xs underline decoration-accent decoration-2 underline-offset-8">Function Coming Soon</p>
               </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}

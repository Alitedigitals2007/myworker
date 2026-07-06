"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnPresence } from "framer-motion";
import { LucideSearch, LucideUser, LucidePackage, LucideShoppingCart, LucideX, LucideArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchResult {
  type: "worker" | "product" | "sale";
  id: string;
  title: string;
  subtitle: string;
  href: string;
}

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const debounce = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [query]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      router.push(results[selectedIndex].href);
      onClose();
    } else if (e.key === "Escape") {
      onClose();
    }
  }, [results, selectedIndex, router, onClose]);

  const getIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "worker": return LucideUser;
      case "product": return LucidePackage;
      case "sale": return LucideShoppingCart;
    }
  };

  if (!open) return null;

  return (
    <AnPresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <div className="flex items-start justify-center pt-[15vh] px-4">
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-xl bg-background rounded-xl shadow-2xl border overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b">
              <LucideSearch size={20} className="text-muted-foreground" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search workers, products, sales..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent outline-none text-lg"
              />
              <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground">
                <LucideX size={18} />
              </Button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading && (
                <div className="p-8 text-center">
                  <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
                </div>
              )}

              {!loading && query && results.length === 0 && (
                <div className="p-8 text-center text-muted-foreground">
                  No results found for "{query}"
                </div>
              )}

              {!loading && results.length > 0 && (
                <div className="py-2">
                  {results.map((result, index) => {
                    const Icon = getIcon(result.type);
                    return (
                      <button
                        key={`${result.type}-${result.id}`}
                        onClick={() => {
                          router.push(result.href);
                          onClose();
                        }}
                        onMouseEnter={() => setSelectedIndex(index)}
                        className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors ${
                          index === selectedIndex ? "bg-muted/50" : ""
                        }`}
                      >
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Icon size={18} className="text-muted-foreground" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium">{result.title}</p>
                          <p className="text-sm text-muted-foreground">{result.subtitle}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground capitalize">{result.type}</span>
                          <LucideArrowRight size={14} className="text-muted-foreground" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {!query && (
                <div className="p-4 text-center text-muted-foreground">
                  <p className="text-sm">Type to search across workers, products, and sales</p>
                  <div className="flex justify-center gap-4 mt-4">
                    <div className="flex items-center gap-2 text-xs">
                      <kbd className="px-2 py-1 bg-muted rounded text-muted-foreground">↑↓</kbd>
                      <span>Navigate</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <kbd className="px-2 py-1 bg-muted rounded text-muted-foreground">↵</kbd>
                      <span>Select</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <kbd className="px-2 py-1 bg-muted rounded text-muted-foreground">Esc</kbd>
                      <span>Close</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnPresence>
  );
}
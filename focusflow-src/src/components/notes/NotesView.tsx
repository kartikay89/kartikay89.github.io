import { useState } from "react";
import { Plus, Search, FileText, Lightbulb, BookOpen, Code2, Tag, Clock, Edit2, Trash2, Copy, Check } from "lucide-react";
import { CodeBlock } from "./CodeBlock";
import type { Note, NoteCategory } from "../../types";
import { clsx } from "clsx";

interface NotesViewProps {
  notes: Note[];
  initialCategory: NoteCategory | "all";
  onAddNote: (note: Note) => void;
  onUpdateNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
}

const CATEGORY_META: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  all:     { label: "All Notes",      icon: FileText,  color: "text-gray-500" },
  inbox:   { label: "Ideas Inbox",    icon: Lightbulb, color: "text-yellow-500" },
  journal: { label: "Daily Journal",  icon: BookOpen,  color: "text-blue-500" },
  code:    { label: "Code Snippets",  icon: Code2,     color: "text-violet-500" },
};

const LANGUAGES = ["python", "javascript", "typescript", "sql", "bash", "html", "css", "json", "yaml", "text"];

function formatRelativeDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function NotesView({ notes, initialCategory, onAddNote, onUpdateNote, onDeleteNote }: NotesViewProps) {
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory);
  const [selectedId, setSelectedId] = useState<string | null>(notes[0]?.id ?? null);
  const [search, setSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [showNewNote, setShowNewNote] = useState(false);
  const [copied, setCopied] = useState(false);

  // New note form state
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategory, setNewCategory] = useState<NoteCategory>("code");
  const [newLanguage, setNewLanguage] = useState("python");
  const [newTags, setNewTags] = useState("");

  const filtered = notes.filter((n) => {
    const matchCat = activeCategory === "all" || n.category === activeCategory;
    const matchSearch = !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const selected = notes.find((n) => n.id === selectedId) ?? filtered[0] ?? null;

  const handleCopy = () => {
    if (selected) {
      navigator.clipboard.writeText(selected.content).catch(() => {});
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleSaveEdit = (updated: Partial<Note>) => {
    if (selected) {
      onUpdateNote({ ...selected, ...updated, updatedAt: new Date().toISOString() });
      setIsEditing(false);
    }
  };

  const handleCreateNote = () => {
    if (!newTitle.trim()) return;
    const note: Note = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      content: newContent,
      category: newCategory,
      tags: newTags.split(",").map((t) => t.trim()).filter(Boolean),
      language: newLanguage,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onAddNote(note);
    setSelectedId(note.id);
    setShowNewNote(false);
    setNewTitle("");
    setNewContent("");
    setNewTags("");
  };

  return (
    <div className="flex-1 flex overflow-hidden bg-white">
      {/* Left: note list */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r border-gray-200 bg-gray-50/50">
        {/* Category tabs */}
        <div className="px-3 pt-4 pb-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-900">Notes</h2>
            <button
              onClick={() => setShowNewNote(true)}
              className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition-colors"
            >
              <Plus size={13} /> New Note
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-8 pr-3 py-2 text-xs border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category pills */}
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(CATEGORY_META).map(([key, meta]) => {
              const Icon = meta.icon;
              const count = key === "all" ? notes.length : notes.filter((n) => n.category === key).length;
              return (
                <button
                  key={key}
                  onClick={() => setActiveCategory(key)}
                  className={clsx(
                    "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors",
                    activeCategory === key
                      ? "bg-blue-600 text-white"
                      : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                  )}
                >
                  <Icon size={11} />
                  {meta.label.split(" ")[0]} <span className="opacity-70">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Note list */}
        <div className="flex-1 overflow-y-auto px-3 pb-4">
          {filtered.length === 0 && (
            <div className="text-center py-8 text-xs text-gray-400">No notes found</div>
          )}
          {filtered.map((note) => {
            const meta = CATEGORY_META[note.category] ?? CATEGORY_META.all;
            const Icon = meta.icon;
            return (
              <button
                key={note.id}
                onClick={() => { setSelectedId(note.id); setIsEditing(false); }}
                className={clsx(
                  "w-full text-left px-3 py-2.5 rounded-xl mb-1 transition-colors",
                  selected?.id === note.id
                    ? "bg-blue-50 border border-blue-200"
                    : "hover:bg-white border border-transparent hover:border-gray-200"
                )}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon size={11} className={meta.color} />
                  <span className="text-xs font-semibold text-gray-800 truncate flex-1">{note.title}</span>
                </div>
                <p className="text-[11px] text-gray-500 line-clamp-2 mb-1">
                  {note.category === "code" ? `${note.language} · ${note.content.split("\n").length} lines` : note.content}
                </p>
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Clock size={9} />
                  {formatRelativeDate(note.updatedAt)}
                  {note.tags.slice(0, 2).map((t) => (
                    <span key={t} className="bg-gray-100 px-1.5 py-0.5 rounded text-[10px]">#{t}</span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right: note detail */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {selected ? (
          <>
            {/* Note header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <div className="flex-1 min-w-0">
                {isEditing ? (
                  <input
                    autoFocus
                    defaultValue={selected.title}
                    onBlur={(e) => handleSaveEdit({ title: e.target.value })}
                    className="text-xl font-bold text-gray-900 w-full focus:outline-none border-b border-blue-400 pb-1 bg-transparent"
                  />
                ) : (
                  <h2 className="text-xl font-bold text-gray-900 truncate">{selected.title}</h2>
                )}
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                  <Clock size={11} />
                  Last edited: {formatRelativeDate(selected.updatedAt)}
                  {selected.tags.map((t) => (
                    <span key={t} className="flex items-center gap-0.5 bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                      <Tag size={9} />#{t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-1.5 ml-4 flex-shrink-0">
                {selected.category === "code" && (
                  <>
                    <select
                      value={isEditing ? selected.language : selected.language}
                      onChange={(e) => handleSaveEdit({ language: e.target.value })}
                      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none"
                    >
                      {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
                      title="Copy code"
                    >
                      {copied ? <Check size={13} className="text-green-600" /> : <Copy size={13} />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </>
                )}
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={clsx(
                    "flex items-center gap-1 text-xs border rounded-lg px-2.5 py-1.5 transition-colors",
                    isEditing ? "border-blue-400 bg-blue-50 text-blue-700" : "border-gray-200 hover:bg-gray-50"
                  )}
                >
                  <Edit2 size={13} /> {isEditing ? "Done" : "Edit"}
                </button>
                <button
                  onClick={() => {
                    onDeleteNote(selected.id);
                    setSelectedId(filtered.find((n) => n.id !== selected.id)?.id ?? null);
                  }}
                  className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            {/* Note content */}
            <div className="flex-1 overflow-y-auto p-6">
              {selected.category === "code" ? (
                isEditing ? (
                  <textarea
                    defaultValue={selected.content}
                    onBlur={(e) => handleSaveEdit({ content: e.target.value })}
                    className="w-full h-full min-h-[400px] font-mono text-sm bg-gray-900 text-green-400 p-4 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                    spellCheck={false}
                  />
                ) : (
                  <CodeBlock code={selected.content} language={selected.language} />
                )
              ) : (
                isEditing ? (
                  <textarea
                    defaultValue={selected.content}
                    onBlur={(e) => handleSaveEdit({ content: e.target.value })}
                    className="w-full h-full min-h-[400px] text-sm text-gray-800 p-4 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
                    placeholder="Write your note..."
                  />
                ) : (
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.content}</p>
                )
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Select a note or create a new one</p>
              <button
                onClick={() => setShowNewNote(true)}
                className="mt-3 flex items-center gap-1.5 mx-auto text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Plus size={16} /> New Note
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New note modal */}
      {showNewNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm" onClick={() => setShowNewNote(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-900 mb-4">New Note</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Title *</label>
                <input
                  autoFocus
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Note title..."
                  onKeyDown={(e) => e.key === "Enter" && handleCreateNote()}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as NoteCategory)}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="code">Code Snippet</option>
                    <option value="inbox">Ideas Inbox</option>
                    <option value="journal">Daily Journal</option>
                  </select>
                </div>
                {newCategory === "code" && (
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">Language</label>
                    <select
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {LANGUAGES.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                )}
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  {newCategory === "code" ? "Code" : "Content"}
                </label>
                <textarea
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={newCategory === "code" ? 6 : 3}
                  className={clsx(
                    "w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500",
                    newCategory === "code" && "font-mono bg-gray-50"
                  )}
                  placeholder={newCategory === "code" ? "Paste your code here..." : "Write your note..."}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Tags (comma-separated)</label>
                <input
                  value={newTags}
                  onChange={(e) => setNewTags(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="python, algorithm, study..."
                />
              </div>
              <div className="flex gap-3 mt-1">
                <button
                  onClick={() => setShowNewNote(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNote}
                  className="flex-1 py-2.5 bg-blue-600 rounded-xl text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Create Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

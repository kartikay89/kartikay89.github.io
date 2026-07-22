import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/db/database";
import { NoteRepository } from "@/db/repositories/NoteRepository";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import {
  FileText,
  Lightbulb,
  BookOpen,
  Code2,
  Plus,
  Search,
  Copy,
  Check,
  Trash2,
} from "lucide-react";
import type { Note, NoteFolder } from "@/types";
import { useState, useCallback } from "react";

const CATEGORIES: {
  id: NoteFolder | "all";
  label: string;
  icon: React.ElementType;
}[] = [
  { id: "all", label: "All Notes", icon: FileText },
  { id: "ideas", label: "Ideas Inbox", icon: Lightbulb },
  { id: "journal", label: "Daily Journal", icon: BookOpen },
  { id: "code", label: "Code Snippets", icon: Code2 },
];

export default function NotesPage() {
  const [category, setCategory] = useState<NoteFolder | "all">("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [copied, setCopied] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newFolder, setNewFolder] = useState<NoteFolder>("ideas");
  const [newType, setNewType] = useState<"text" | "code">("text");
  const [newLang, setNewLang] = useState("python");

  const notes =
    useLiveQuery(
      () =>
        category === "all"
          ? db.notes
              .filter((n) => !n.deletedAt && !n.archived)
              .toArray()
          : db.notes
              .filter(
                (n) =>
                  !n.deletedAt && !n.archived && n.folder === category
              )
              .toArray(),
      [category]
    ) ?? [];

  const filtered = notes.filter(
    (n) =>
      !search ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
  );
  const sortedNotes = [...filtered].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt)
  );

  const selectedNote =
    notes.find((n) => n.id === selectedId) ?? sortedNotes[0] ?? null;

  const handleStartEdit = () => {
    if (!selectedNote) return;
    setEditTitle(selectedNote.title);
    setEditContent(selectedNote.content);
    setIsEditing(true);
  };

  // Uses NoteRepository.update() which stamps updatedAt + syncStatus automatically
  const handleSave = useCallback(async () => {
    if (!selectedNote) return;
    await NoteRepository.update(selectedNote.id, {
      title: editTitle || selectedNote.title,
      content: editContent,
    });
    setIsEditing(false);
  }, [selectedNote, editTitle, editContent]);

  const handleCopy = async () => {
    if (!selectedNote) return;
    await navigator.clipboard.writeText(selectedNote.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!selectedNote) return;
    await NoteRepository.delete(selectedNote.id);
    setSelectedId(null);
  };

  const handleCreateNote = async () => {
    if (!newTitle.trim()) return;
    const note = await NoteRepository.create({
      title: newTitle,
      type: newType,
      language: newType === "code" ? newLang : undefined,
      content: "",
      tags: [],
      folder: newFolder,
      archived: false,
    });
    setSelectedId(note.id);
    setShowNew(false);
    setNewTitle("");
    // Immediately open for editing
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsEditing(true);
  };

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* ── Category sidebar (desktop only) ── */}
      <div className="hidden md:flex flex-col w-44 border-r border-gray-200 bg-white py-4 flex-shrink-0">
        <div className="px-4 mb-3">
          <h2 className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">
            Notes
          </h2>
        </div>
        {CATEGORIES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setCategory(id as NoteFolder | "all")}
            className={cn(
              "flex items-center gap-2.5 px-4 py-2 text-sm font-medium transition-colors",
              category === id
                ? "bg-[#eaf1ff] text-[#1463ff]"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
        <div className="mt-3 px-4 border-t border-gray-100 pt-3">
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 text-sm text-[#1463ff] font-medium hover:opacity-80"
          >
            <Plus size={15} /> New Note
          </button>
        </div>
      </div>

      {/* ── Notes list ── */}
      <div className="w-72 flex-shrink-0 border-r border-gray-200 bg-[#f8fafc] flex flex-col">
        {/* Search */}
        <div className="px-3 py-3 border-b border-gray-200 bg-white">
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
            />
          </div>
        </div>

        {/* Note cards */}
        <div className="flex-1 overflow-y-auto">
          {sortedNotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-sm text-gray-400 px-4 text-center">
              <FileText size={32} className="text-gray-200 mb-2" />
              No notes yet.
            </div>
          ) : (
            sortedNotes.map((note: Note) => (
              <button
                key={note.id}
                onClick={() => {
                  setSelectedId(note.id);
                  setIsEditing(false);
                }}
                className={cn(
                  "w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-white transition-colors",
                  selectedNote?.id === note.id &&
                    "bg-white border-l-2 border-l-[#1463ff]"
                )}
              >
                <div className="flex items-start gap-2 mb-1">
                  <span className="flex-1 text-sm font-medium text-gray-900 line-clamp-1">
                    {note.title}
                  </span>
                  {note.type === "code" && (
                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                      {note.language}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 line-clamp-2">
                  {note.content.slice(0, 80)}
                </p>
                <p className="text-[10px] text-gray-300 mt-1">
                  {new Date(note.updatedAt).toLocaleDateString()}
                </p>
              </button>
            ))
          )}
        </div>

        {/* Mobile: new note button */}
        <div className="md:hidden px-3 py-2 border-t border-gray-100 bg-white">
          <Button
            variant="primary"
            size="sm"
            className="w-full"
            onClick={() => setShowNew(true)}
          >
            <Plus size={14} /> New Note
          </Button>
        </div>
      </div>

      {/* ── Editor / viewer ── */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {selectedNote ? (
          <>
            {/* Note header */}
            <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 flex-shrink-0">
              {isEditing ? (
                <input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="flex-1 text-lg font-semibold text-gray-900 border-none outline-none bg-transparent"
                  placeholder="Note title..."
                />
              ) : (
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedNote.title}
                  </h2>
                  <p className="text-[11px] text-gray-400">
                    Updated{" "}
                    {new Date(selectedNote.updatedAt).toLocaleString()}
                  </p>
                </div>
              )}

              <div className="flex items-center gap-1 ml-4">
                <button
                  onClick={handleCopy}
                  className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Copy content"
                >
                  {copied ? (
                    <Check size={15} className="text-green-500" />
                  ) : (
                    <Copy size={15} />
                  )}
                </button>
                {isEditing ? (
                  <Button variant="primary" size="sm" onClick={handleSave}>
                    Save
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleStartEdit}
                  >
                    Edit
                  </Button>
                )}
                <button
                  onClick={handleDelete}
                  className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                  aria-label="Delete note"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-auto">
              {isEditing ? (
                // TODO: replace textarea with CodeMirror 6 editor for code notes when @codemirror/* is installed
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className={cn(
                    "w-full h-full p-6 text-sm text-gray-800 resize-none border-none outline-none",
                    selectedNote.type === "code" &&
                      "font-mono text-[13px] bg-gray-950 text-gray-100"
                  )}
                  placeholder="Start writing..."
                  spellCheck={selectedNote.type !== "code"}
                />
              ) : selectedNote.type === "code" ? (
                // TODO: replace with CodeMirror 6 read-only view when @codemirror/* is installed
                <div className="h-full flex flex-col">
                  <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 flex-shrink-0">
                    <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">
                      {selectedNote.language || "text"}
                    </span>
                  </div>
                  <pre className="m-0 p-6 text-sm font-mono bg-gray-950 text-gray-100 overflow-auto flex-1 whitespace-pre-wrap break-words">
                    <code>{selectedNote.content}</code>
                  </pre>
                </div>
              ) : (
                <div className="p-6 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {selectedNote.content}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-300">
            <div className="text-center">
              <FileText size={48} className="mx-auto mb-3 text-gray-200" />
              <p className="text-sm">Select a note or create one</p>
            </div>
          </div>
        )}
      </div>

      {/* ── New note dialog ── */}
      {showNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl">
            <h3 className="font-bold text-gray-900 mb-4">New Note</h3>
            <div className="flex flex-col gap-3">
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateNote()}
                placeholder="Note title..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <select
                value={newFolder}
                onChange={(e) =>
                  setNewFolder(e.target.value as NoteFolder)
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none"
              >
                <option value="ideas">Ideas Inbox</option>
                <option value="journal">Daily Journal</option>
                <option value="code">Code Snippets</option>
              </select>
              <select
                value={newType}
                onChange={(e) =>
                  setNewType(e.target.value as "text" | "code")
                }
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none"
              >
                <option value="text">Text / Markdown</option>
                <option value="code">Code</option>
              </select>
              {newType === "code" && (
                <select
                  value={newLang}
                  onChange={(e) => setNewLang(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none"
                >
                  {[
                    "python",
                    "sql",
                    "javascript",
                    "typescript",
                    "json",
                    "shell",
                    "java",
                    "yaml",
                    "html",
                    "css",
                  ].map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <div className="flex gap-3 mt-5">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setShowNew(false);
                  setNewTitle("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="flex-1"
                onClick={handleCreateNote}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

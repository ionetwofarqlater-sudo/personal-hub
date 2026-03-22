"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Plus, Save, Pencil, Trash2, X } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import type { NoteItem } from "@/types/domain";

const STORAGE_KEY = "personal-hub-notes-v1";

export default function NotesPage() {
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editorTab, setEditorTab] = useState<"edit" | "preview">("edit");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved) as NoteItem[];
      if (Array.isArray(parsed)) {
        setNotes(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  const sortedNotes = useMemo(
    () => [...notes].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)),
    [notes]
  );

  function resetForm() {
    setTitle("");
    setContent("");
    setEditingId(null);
  }

  function handleSaveNote() {
    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    if (!cleanTitle && !cleanContent) return;

    const nowIso = new Date().toISOString();
    if (editingId) {
      setNotes(previous =>
        previous.map(note =>
          note.id === editingId
            ? { ...note, title: cleanTitle || "Без назви", content: cleanContent, updatedAt: nowIso }
            : note
        )
      );
    } else {
      const newNote: NoteItem = {
        id: crypto.randomUUID(),
        title: cleanTitle || "Без назви",
        content: cleanContent,
        updatedAt: nowIso
      };
      setNotes(previous => [newNote, ...previous]);
    }

    resetForm();
  }

  function handleEditNote(note: NoteItem) {
    setEditingId(note.id);
    setTitle(note.title);
    setContent(note.content);
  }

  function handleDeleteNote(noteId: string) {
    setNotes(previous => previous.filter(note => note.id !== noteId));
    if (editingId === noteId) {
      resetForm();
    }
  }

  function handleExportMarkdown(note: NoteItem) {
    const markdown = `# ${note.title}\n\n${note.content}`;
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const safeName = note.title.toLowerCase().replace(/[^a-z0-9а-яіїєґ\-_ ]/gi, "").trim().replace(/\s+/g, "-") || "note";
    anchor.href = url;
    anchor.download = `${safeName}.md`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="animate-fade-in">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Назад
      </Link>
      <h1 className="text-3xl font-bold text-white mb-2">Нотатки</h1>
      <p className="text-gray-400 mb-8">Швидкі нотатки з локальним збереженням</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-white font-semibold text-lg">
            {editingId ? "Редагування нотатки" : "Нова нотатка"}
          </h2>

          <div className="inline-flex rounded-xl border border-gray-700 overflow-hidden">
            <button
              onClick={() => setEditorTab("edit")}
              className={`px-4 py-2 text-sm transition-colors ${editorTab === "edit" ? "bg-violet-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
            >
              Редактор
            </button>
            <button
              onClick={() => setEditorTab("preview")}
              className={`px-4 py-2 text-sm transition-colors ${editorTab === "preview" ? "bg-violet-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
            >
              Preview
            </button>
          </div>

          <input
            value={title}
            onChange={event => setTitle(event.target.value)}
            placeholder="Заголовок"
            className="w-full bg-gray-800/60 border border-gray-700 focus:border-violet-500 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
          />

          {editorTab === "edit" ? (
            <textarea
              value={content}
              onChange={event => setContent(event.target.value)}
              placeholder="Текст нотатки... (markdown підтримується)"
              rows={9}
              className="w-full bg-gray-800/60 border border-gray-700 focus:border-violet-500 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-y"
            />
          ) : (
            <div className="min-h-[230px] w-full bg-gray-800/60 border border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-200 prose prose-invert prose-sm max-w-none">
              {content.trim() ? <ReactMarkdown>{content}</ReactMarkdown> : <p className="text-gray-500">Немає тексту для preview.</p>}
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveNote}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
            >
              {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editingId ? "Зберегти" : "Додати"}
            </button>

            {editingId && (
              <button
                onClick={resetForm}
                className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
              >
                <X className="w-4 h-4" /> Скасувати
              </button>
            )}
          </div>
        </div>

        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5">
          <h2 className="text-white font-semibold text-lg mb-4">Список нотаток</h2>

          {sortedNotes.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-700 p-10 text-center text-gray-500 text-sm">
              Ще немає нотаток. Створи першу ✍️
            </div>
          ) : (
            <div className="space-y-3 max-h-[560px] overflow-auto pr-1">
              {sortedNotes.map(note => (
                <article key={note.id} className="rounded-xl border border-gray-800 bg-gray-800/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-white font-medium text-sm">{note.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Оновлено: {new Date(note.updatedAt).toLocaleString("uk-UA")}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleExportMarkdown(note)}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors"
                        title="Експорт .md"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditNote(note)}
                        className="p-2 rounded-lg text-gray-400 hover:text-violet-300 hover:bg-violet-500/10 transition-colors"
                        title="Редагувати"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        title="Видалити"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {note.content && (
                    <p className="text-sm text-gray-300 mt-3 whitespace-pre-wrap break-words">{note.content}</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

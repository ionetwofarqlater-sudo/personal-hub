"use client";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Copy, Pin, PinOff, Plus, Save, Search, Tag, Trash2, X } from "lucide-react";
import Link from "next/link";
import type { DropItem } from "@/types/domain";

const STORAGE_KEY = "personal-hub-clouddrop-v1";

export default function ClouddropPage() {
  const [items, setItems] = useState<DropItem[]>([]);
  const [search, setSearch] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as DropItem[];
      if (Array.isArray(parsed)) {
        setItems(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    const sorted = [...items].sort((left, right) => {
      if (left.pinned !== right.pinned) return left.pinned ? -1 : 1;
      return right.updatedAt.localeCompare(left.updatedAt);
    });

    if (!query) return sorted;
    return sorted.filter(item => {
      const inTitle = item.title.toLowerCase().includes(query);
      const inContent = item.content.toLowerCase().includes(query);
      const inTags = item.tags.some(tag => tag.toLowerCase().includes(query));
      return inTitle || inContent || inTags;
    });
  }, [items, search]);

  function parseTags(value: string) {
    return value
      .split(",")
      .map(tag => tag.trim())
      .filter(Boolean);
  }

  function resetForm() {
    setTitle("");
    setContent("");
    setTagsInput("");
    setEditingId(null);
  }

  function handleSaveItem() {
    const cleanTitle = title.trim();
    const cleanContent = content.trim();
    if (!cleanTitle && !cleanContent) return;

    const nextTags = parseTags(tagsInput);
    const nowIso = new Date().toISOString();

    if (editingId) {
      setItems(previous =>
        previous.map(item =>
          item.id === editingId
            ? {
                ...item,
                title: cleanTitle || "Без назви",
                content: cleanContent,
                tags: nextTags,
                updatedAt: nowIso
              }
            : item
        )
      );
    } else {
      const nextItem: DropItem = {
        id: crypto.randomUUID(),
        title: cleanTitle || "Без назви",
        content: cleanContent,
        tags: nextTags,
        pinned: false,
        updatedAt: nowIso
      };
      setItems(previous => [nextItem, ...previous]);
    }

    resetForm();
  }

  function handleEditItem(item: DropItem) {
    setEditingId(item.id);
    setTitle(item.title);
    setContent(item.content);
    setTagsInput(item.tags.join(", "));
  }

  function handleDeleteItem(itemId: string) {
    setItems(previous => previous.filter(item => item.id !== itemId));
    if (editingId === itemId) {
      resetForm();
    }
  }

  function handleTogglePin(itemId: string) {
    setItems(previous =>
      previous.map(item =>
        item.id === itemId
          ? { ...item, pinned: !item.pinned, updatedAt: new Date().toISOString() }
          : item
      )
    );
  }

  async function handleCopy(contentValue: string, itemId: string) {
    try {
      await navigator.clipboard.writeText(contentValue);
      setCopiedId(itemId);
      setTimeout(() => setCopiedId(null), 1200);
    } catch {}
  }

  return (
    <div className="animate-fade-in">
      <Link href="/dashboard" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Назад
      </Link>
      <h1 className="text-3xl font-bold text-white mb-2">CloudDrop</h1>
      <p className="text-gray-400 mb-8">Хмарний буфер обміну з пошуком і тегами</p>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-white font-semibold text-lg">
            {editingId ? "Редагування дропу" : "Новий дроп"}
          </h2>

          <input
            value={title}
            onChange={event => setTitle(event.target.value)}
            placeholder="Назва"
            className="w-full bg-gray-800/60 border border-gray-700 focus:border-violet-500 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
          />

          <textarea
            value={content}
            onChange={event => setContent(event.target.value)}
            placeholder="Текст або фрагмент для буфера..."
            rows={7}
            className="w-full bg-gray-800/60 border border-gray-700 focus:border-violet-500 text-white placeholder-gray-500 rounded-xl px-4 py-3 text-sm outline-none transition-colors resize-y"
          />

          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={tagsInput}
              onChange={event => setTagsInput(event.target.value)}
              placeholder="Теги через кому: work, code, link"
              className="w-full bg-gray-800/60 border border-gray-700 focus:border-violet-500 text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-colors"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveItem}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
            >
              {editingId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />} {editingId ? "Зберегти" : "Додати"}
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
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={event => setSearch(event.target.value)}
              placeholder="Пошук по назві, тексту або тегу"
              className="w-full bg-gray-800/60 border border-gray-700 focus:border-violet-500 text-white placeholder-gray-500 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none transition-colors"
            />
          </div>

          {filteredItems.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-700 p-10 text-center text-gray-500 text-sm">
              Немає записів. Додай перший CloudDrop.
            </div>
          ) : (
            <div className="space-y-3 max-h-[560px] overflow-auto pr-1">
              {filteredItems.map(item => (
                <article key={item.id} className="rounded-xl border border-gray-800 bg-gray-800/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-white font-medium text-sm">{item.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">Оновлено: {new Date(item.updatedAt).toLocaleString("uk-UA")}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopy(item.content, item.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-blue-300 hover:bg-blue-500/10 transition-colors"
                        title="Копіювати"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleTogglePin(item.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors"
                        title={item.pinned ? "Відкріпити" : "Закріпити"}
                      >
                        {item.pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleEditItem(item)}
                        className="p-2 rounded-lg text-gray-400 hover:text-violet-300 hover:bg-violet-500/10 transition-colors"
                        title="Редагувати"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 rounded-lg text-gray-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        title="Видалити"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {copiedId === item.id && <p className="text-xs text-emerald-400 mt-2">Скопійовано ✓</p>}

                  {item.content && <p className="text-sm text-gray-300 mt-3 whitespace-pre-wrap break-words">{item.content}</p>}

                  {item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {item.tags.map(tag => (
                        <span key={`${item.id}-${tag}`} className="text-xs px-2 py-1 rounded-full bg-gray-700/70 text-gray-200 border border-gray-600">
                          #{tag}
                        </span>
                      ))}
                    </div>
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

interface Note {
  id: string
  content: string
  authorId: string
  createdAt: Date
}

export default function InternalNote({
  notes,
  noteText,
  onNoteChange,
  onAddNote,
}: {
  notes: Note[]
  noteText: string
  onNoteChange: (v: string) => void
  onAddNote: () => void
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-amber-400">Note interne — visible uniquement par vous</p>

      <div className="space-y-2">
        {notes.map((note) => (
          <div key={note.id} className="rounded-lg border border-amber-900/30 bg-amber-950/20 px-3 py-2">
            <p className="text-sm text-zinc-300">{note.content}</p>
            <p className="mt-1 text-[10px] text-zinc-600">{new Date(note.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          value={noteText}
          onChange={(e) => onNoteChange(e.target.value)}
          placeholder="Ajouter une note..."
          className="flex-1 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-sm text-zinc-100 outline-none transition focus:border-purple-500"
        />
        <button
          onClick={onAddNote}
          disabled={!noteText.trim()}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-500 disabled:opacity-50"
        >
          Ajouter
        </button>
      </div>
    </div>
  )
}

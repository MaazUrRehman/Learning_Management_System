import { Search } from "lucide-react";

const TableToolbar = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  sortBy,
  onSortChange,
  pageSize,
  onPageSizeChange,
  sortOptions,
  placeholder = "Search records...",
  showPageSize = true,
}) => {
  return (
    <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div className="flex-1 min-w-0">
        <label className="relative block w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-3xl border border-slate-800 bg-slate-950/90 py-3 pl-4 pr-28 text-slate-100 outline-none transition focus:border-violet-400"
          />
          <button
            type="button"
            onClick={onSearchSubmit}
            className="absolute right-2 top-1/2 flex h-10 items-center justify-center gap-2 rounded-full border border-slate-700 bg-slate-900/95 px-4 text-slate-100 transition hover:border-violet-400 hover:text-white hover:bg-slate-800 -translate-y-1/2"
          >
            <Search size={16} />
            Search
          </button>
        </label>
      </div>

      <div className={`grid w-full gap-3 xl:w-auto ${showPageSize ? "sm:grid-cols-2 xl:grid-cols-[1fr_1fr]" : "sm:grid-cols-1 xl:grid-cols-[1fr]"}`}>
        <label className="space-y-2 text-sm text-slate-300">
          Sort by
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none focus:border-violet-400"
          >
            <option value="">None</option>
            {sortOptions.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
        {showPageSize && (
          <label className="space-y-2 text-sm text-slate-300">
            Show
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="w-full rounded-3xl border border-slate-800 bg-slate-950/90 px-4 py-3 text-slate-100 outline-none focus:border-violet-400"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </label>
        )}
      </div>
    </div>
  );
};

export default TableToolbar;

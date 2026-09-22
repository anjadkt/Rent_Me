interface VehicleFiltersProps {
  search: string;
  category: string;
  sort: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onSortChange: (value: string) => void;
}

export default function VehicleFilters({
  search,
  category,
  sort,
  onSearchChange,
  onCategoryChange,
  onSortChange,
}: VehicleFiltersProps) {
  return (
    <div className="flex justify-center w-full">
      {/* Combined Search Bar Card */}
      <div className="bg-white rounded-2xl p-2 sm:p-2.5 border border-slate-200/80 shadow-sm flex flex-row flex-wrap items-center gap-2 w-full max-w-5xl">
        {/* Search */}
        <div className="flex-1 min-w-[200px] flex items-center px-3 py-1">
          <svg className="w-4 h-4 text-slate-400 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search Vehicle or Model"
            className="w-full text-xs font-medium text-slate-800 placeholder-slate-400 outline-none bg-transparent"
          />
        </div>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />
        
        {/* Category */}
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full sm:w-auto px-3 py-1.5 border-none bg-transparent text-xs font-medium text-slate-700 outline-none focus:ring-0 cursor-pointer"
        >
          <option value="">All Categories</option>
          <option value="bike">Bikes</option>
          <option value="ev_bike">EV Bikes</option>
          <option value="cycle">Cycles</option>
        </select>

        <div className="h-6 w-px bg-slate-200 hidden sm:block" />

        {/* Sort */}
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-full sm:w-auto px-3 py-1.5 border-none bg-transparent text-xs font-medium text-slate-700 outline-none focus:ring-0 cursor-pointer"
        >
          <option value="latest">Latest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="name-asc">Name: A-Z</option>
          <option value="name-desc">Name: Z-A</option>
        </select>
      </div>
    </div>
  );
}
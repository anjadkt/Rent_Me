interface VehiclePaginationProps {
  page: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
}

export default function VehiclePagination({
  page,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
}: VehiclePaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-10 flex items-center justify-center gap-1.5">
      <button
        disabled={!hasPreviousPage}
        onClick={() => onPageChange(page - 1)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition"
      >
        Previous
      </button>

      <div className="flex items-center gap-1">
        {Array.from({ length: totalPages }, (_, index) => index + 1).map(
          (pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => onPageChange(pageNumber)}
              className={`h-8 w-8 rounded-lg text-xs font-semibold transition ${
                pageNumber === page
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {pageNumber}
            </button>
          )
        )}
      </div>

      <button
        disabled={!hasNextPage}
        onClick={() => onPageChange(page + 1)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition"
      >
        Next
      </button>
    </div>
  );
}
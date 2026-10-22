import { useId, useState } from "react";
import type { ReactNode } from "react";
import Icon from "../icon/Icon";
import Spinner from "../form/Spinner";

// One column of the list: its heading and how to show an item in it
export type ListColumn<T> = {
  header: string;
  render: (item: T) => ReactNode;
  className?: string; // extra classes for the header and cells, e.g. "text-right"
};

type ListProps<T> = {
  items: T[];
  columns: ListColumn<T>[];
  getKey: (item: T) => string;
  // The text an item is searched by, e.g. (cls) => `${cls.name} ${cls.description}`
  getSearchText: (item: T) => string;
  pageSize?: number;
  searchPlaceholder?: string;
  isLoading?: boolean;
  emptyMessage?: string;
};

// How many page-number buttons to show at most
const MAX_PAGE_BUTTONS = 5;

const pageButtonBaseClassName =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 text-sm font-medium " +
  "transition duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 " +
  "disabled:cursor-not-allowed disabled:opacity-50";

const pageButtonClassName = `${pageButtonBaseClassName} border border-slate-300 bg-white text-slate-700 enabled:hover:bg-slate-50`;

const currentPageButtonClassName = `${pageButtonBaseClassName} border border-blue-600 bg-blue-600 text-white`;

// A table with a search box on top and pagination below.
// Search and paging happen in the browser on the items you pass in,
// so the page only has to load its data once.
function List<T>({
  items,
  columns,
  getKey,
  getSearchText,
  pageSize = 10,
  searchPlaceholder = "Search...",
  isLoading = false,
  emptyMessage = "No records yet.",
}: ListProps<T>) {
  const searchId = useId();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // 1. Search: keep items whose text contains the search words (upper/lower case ignored)
  const searchText = search.trim().toLowerCase();
  const filteredItems = searchText
    ? items.filter((item) => getSearchText(item).toLowerCase().includes(searchText))
    : items;

  // 2. Paging. If the current page no longer exists (e.g. after a delete or a search),
  // show the last page that does.
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filteredItems.slice(startIndex, startIndex + pageSize);

  // 3. Page-number buttons: up to MAX_PAGE_BUTTONS pages around the current one
  const firstButton = Math.max(1, Math.min(currentPage - 2, totalPages - MAX_PAGE_BUTTONS + 1));
  const lastButton = Math.min(totalPages, firstButton + MAX_PAGE_BUTTONS - 1);
  const pageNumbers: number[] = [];
  for (let number = firstButton; number <= lastButton; number++) pageNumbers.push(number);

  // A new search starts again from page 1
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Search box */}
      <div className="border-b border-slate-200 p-4">
        <label htmlFor={searchId} className="sr-only">
          Search
        </label>
        <div className="relative max-w-sm">
          <Icon
            name="Search"
            size={16}
            className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-slate-400"
          />
          <input
            id={searchId}
            type="search"
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="block w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-9 text-sm text-slate-900 shadow-xs placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
          />
        </div>
      </div>

      {/* Table. overflow-x-auto: scrolls sideways on small screens */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold tracking-wide text-slate-500 uppercase">
            <tr>
              {columns.map((column) => (
                <th key={column.header} className={`px-4 py-3 ${column.className ?? ""}`}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {isLoading && (
              <tr>
                <td colSpan={columns.length} className="py-8">
                  <div className="flex justify-center text-slate-500">
                    <Spinner className="h-5 w-5" />
                  </div>
                </td>
              </tr>
            )}

            {/* Nothing to show: either no data at all, or nothing matches the search */}
            {!isLoading && pageItems.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-500">
                  {items.length === 0 ? emptyMessage : `No results for "${search.trim()}"`}
                </td>
              </tr>
            )}

            {!isLoading &&
              pageItems.map((item) => (
                <tr key={getKey(item)} className="hover:bg-slate-50">
                  {columns.map((column) => (
                    <td key={column.header} className={`px-4 py-3 ${column.className ?? ""}`}>
                      {column.render(item)}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Pagination: only shown when there is something to page through */}
      {!isLoading && filteredItems.length > 0 && (
        <div className="flex flex-col items-center gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:justify-between">
          <p className="text-sm text-slate-600">
            Showing <span className="font-medium">{startIndex + 1}</span>–
            <span className="font-medium">{startIndex + pageItems.length}</span> of{" "}
            <span className="font-medium">{filteredItems.length}</span>
          </p>

          {totalPages > 1 && (
            <nav aria-label="Pagination" className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
                className={pageButtonClassName}
              >
                <Icon name="ChevronLeft" size={16} />
              </button>

              {/* Page numbers on tablets and desktops */}
              {pageNumbers.map((number) => (
                <button
                  key={number}
                  type="button"
                  onClick={() => setPage(number)}
                  aria-current={number === currentPage ? "page" : undefined}
                  className={`hidden sm:inline-flex ${
                    number === currentPage ? currentPageButtonClassName : pageButtonClassName
                  }`}
                >
                  {number}
                </button>
              ))}

              {/* Short version on phones, to save space */}
              <span className="px-2 text-sm text-slate-600 sm:hidden">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
                className={pageButtonClassName}
              >
                <Icon name="ChevronRight" size={16} />
              </button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}

export default List;

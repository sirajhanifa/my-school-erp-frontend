import { useId, useState } from "react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Icon from "../icon/Icon";

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

// How many grey placeholder rows to show while loading
const SKELETON_ROWS = 5;

// Same side padding everywhere, so search, headers, cells and footer line up
const cellPaddingClassName = "px-4 sm:px-6";

// A table with a search box on top and pagination below.
// Search and paging run in the browser on the items you pass in.
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
    // overflow-hidden: keeps the grey header inside the rounded corners.
    // Same soft hover shadow as Card, so lists and forms feel alike.
    <div className="w-full overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow duration-200 hover:shadow-xl hover:shadow-slate-900/10 motion-reduce:transition-none">
      {/* Toolbar: record count on the left, search on the right (stacked on phones) */}
      <div
        className={`flex flex-col gap-3 border-b py-4 sm:flex-row sm:items-center sm:justify-between ${cellPaddingClassName}`}
      >
        {isLoading ? (
          <Skeleton className="h-4 w-24" />
        ) : (
          <p className="text-sm text-muted-foreground">
            {/* While searching, show how many of all records match */}
            {searchText ? (
              <>
                <span className="font-semibold text-foreground">{filteredItems.length}</span> of {items.length}{" "}
                records
              </>
            ) : (
              <>
                <span className="font-semibold text-foreground">{items.length}</span>{" "}
                {items.length === 1 ? "record" : "records"}
              </>
            )}
          </p>
        )}

        <label htmlFor={searchId} className="sr-only">
          Search
        </label>
        <InputGroup className="w-full sm:w-72">
          <InputGroupAddon>
            <Icon name="Search" size={16} />
          </InputGroupAddon>
          <InputGroupInput
            id={searchId}
            type="search"
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
          />
        </InputGroup>
      </div>

      <Table>
        <TableHeader className="bg-muted/60">
          <TableRow className="hover:bg-transparent">
            {columns.map((column) => (
              <TableHead
                key={column.header}
                className={`h-11 text-xs font-semibold tracking-wide text-muted-foreground uppercase ${cellPaddingClassName} ${column.className ?? ""}`}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Loading: grey placeholder rows in the shape of the table */}
          {isLoading &&
            Array.from({ length: SKELETON_ROWS }, (_, row) => (
              <TableRow key={row} className="hover:bg-transparent">
                {columns.map((column) => (
                  <TableCell key={column.header} className={`py-3.5 ${cellPaddingClassName}`}>
                    <Skeleton className="h-4 w-full max-w-40" />
                  </TableCell>
                ))}
              </TableRow>
            ))}

          {/* Nothing to show: either no data at all, or nothing matches the search */}
          {!isLoading && pageItems.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={columns.length}
                className={`py-12 text-center whitespace-normal text-muted-foreground ${cellPaddingClassName}`}
              >
                {items.length === 0 ? emptyMessage : `No results for "${search.trim()}"`}
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            pageItems.map((item) => (
              // Light grey on hover, like the sidebar rows
              <TableRow
                key={getKey(item)}
                className="transition-colors duration-150 hover:bg-muted/40 motion-reduce:transition-none"
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.header}
                    className={`py-3.5 whitespace-normal text-foreground ${cellPaddingClassName} ${column.className ?? ""}`}
                  >
                    {column.render(item)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
        </TableBody>
      </Table>

      {/* Pagination: only shown when there is something to page through */}
      {!isLoading && filteredItems.length > 0 && (
        <div
          className={`flex flex-col items-center gap-3 border-t bg-muted/30 py-3 sm:flex-row sm:justify-between ${cellPaddingClassName}`}
        >
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">{startIndex + 1}</span>–
            <span className="font-medium text-foreground">{startIndex + pageItems.length}</span> of{" "}
            <span className="font-medium text-foreground">{filteredItems.length}</span>
          </p>

          {totalPages > 1 && (
            <nav aria-label="Pagination" className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setPage(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous page"
              >
                <Icon name="ChevronLeft" size={16} />
              </Button>

              {/* Page numbers on tablets and desktops */}
              {pageNumbers.map((number) => (
                <Button
                  key={number}
                  variant={number === currentPage ? "default" : "outline"}
                  size="icon-sm"
                  onClick={() => setPage(number)}
                  aria-current={number === currentPage ? "page" : undefined}
                  className="hidden sm:inline-flex"
                >
                  {number}
                </Button>
              ))}

              {/* Short version on phones, to save space */}
              <span className="px-2 text-sm text-muted-foreground sm:hidden">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next page"
              >
                <Icon name="ChevronRight" size={16} />
              </Button>
            </nav>
          )}
        </div>
      )}
    </div>
  );
}

export default List;

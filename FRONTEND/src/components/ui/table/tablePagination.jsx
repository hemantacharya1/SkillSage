import React from "react";
import { Button } from "../button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function TablePagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const pageNumbers = [];

    pageNumbers.push(1);

    const delta = 1;
    let start = Math.max(2, currentPage - delta);
    let end = Math.min(totalPages - 1, currentPage + delta);

    if (start === 2) {
      start = 2;
    } else if (start > 2) {
      pageNumbers.push("...");
    }

    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }

    if (end === totalPages - 1) {
      end = totalPages - 1;
    } else if (end < totalPages - 1) {
      pageNumbers.push("...");
    }

    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="icon"
        className="h-6 w-6"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || !totalPages}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {totalPages === 0 ? (
        <span className="px-2">...</span>
      ) : (
        pageNumbers.map((page, index) =>
          page === "..." ? (
            <span key={`ellipsis-${index}`} className="px-2">
              ...
            </span>
          ) : (
            <Button
              key={`page-${page}`}
              size="icon"
              variant={currentPage === page ? "default" : "outline"}
              className="h-6 w-6 text-[12px]"
              onClick={() => onPageChange(page)}
            >
              {page}
            </Button>
          )
        )
      )}

      <Button
        variant="outline"
        className="h-6 w-6"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || !totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

import { cx } from "../lib/format.js";

export default function Pagination({ pagination, setFilters }) {
  const pages = Array.from(
    { length: pagination.totalPages },
    (_, index) => index + 1,
  );

  return (
    <div className="pagination">
      <button
        className="page-button"
        disabled={pagination.page <= 1}
        onClick={() =>
          setFilters((current) => ({ ...current, page: current.page - 1 }))
        }
      >
        ‹
      </button>
      {pages.map((page) => (
        <button
          key={page}
          className={cx("page-button", page === pagination.page && "active")}
          onClick={() => setFilters((current) => ({ ...current, page }))}
        >
          {page}
        </button>
      ))}
      <button
        className="page-button"
        disabled={pagination.page >= pagination.totalPages}
        onClick={() =>
          setFilters((current) => ({ ...current, page: current.page + 1 }))
        }
      >
        ›
      </button>
    </div>
  );
}

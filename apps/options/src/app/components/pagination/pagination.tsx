import React from "react";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  const renderNumericButtons = () => {
    const numericButtons = [];
    const showFirstNumeric = currentPage > 3;
    const showLastNumeric = currentPage < totalPages - 2;

    if (showFirstNumeric) {
      numericButtons.push(
        <button
          key="pagination-1"
          onClick={() => handlePageClick(1)}
          className={`${
            currentPage === 1
              ? "text-lightwhite bg-[#0A1314]"
              : "text-second bg-transparent"
          } border-2 border-obsidianBlack rounded-xl`}
        >
          1
        </button>
      );
      if (currentPage > 4) {
        numericButtons.push(
          <span key="start-ellipsis" className="text-second">
            ...
          </span>
        );
      }
    }

    for (
      let page = Math.max(1, currentPage - 2);
      page <= Math.min(totalPages, currentPage + 2);
      page++
    ) {
      numericButtons.push(
        <button
          key={`pagination-${page}`}
          onClick={() => handlePageClick(page)}
          className={`${
            currentPage === page
              ? "text-lightwhite bg-[#0A1314]"
              : "text-second bg-transparent"
          } border-2 border-obsidianBlack rounded-xl`}
        >
          {page}
        </button>
      );
    }

    if (showLastNumeric) {
      if (currentPage < totalPages - 3) {
        numericButtons.push(
          <span key="end-ellipsis" className="text-second">
            ...
          </span>
        );
      }
      numericButtons.push(
        <button
          key={`pagination-${totalPages}`}
          onClick={() => handlePageClick(totalPages)}
          className={`${
            currentPage === totalPages
              ? "text-lightwhite bg-[#0A1314]"
              : "text-second bg-transparent"
          } border-2 border-obsidianBlack rounded-xl`}
        >
          {totalPages}
        </button>
      );
    }

    return numericButtons;
  };

  return (
    <nav className="my-25 flex items-center justify-center flex-wrap gap-10 [&>button]:w-50 [&>button]:h-50 [&>button]:flex [&>button]:items-center [&>button]:justify-center">
      <button
        onClick={() => handlePageClick(currentPage - 1)}
        className="border-2 border-obsidianBlack rounded-xl bg-transparent hover:bg-[#0A1314]"
        disabled={currentPage === 1}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="19.862"
          height="19.862"
          viewBox="0 0 19.862 19.862"
        >
          <g
            id="_9041645_arrow_top_right_icon_1_"
            data-name="9041645_arrow_top_right_icon (1)"
            transform="translate(18.128 9.931) rotate(135)"
          >
            <path
              id="Path_3722"
              data-name="Path 3722"
              d="M11.593,0V11.593H0"
              transform="translate(0 0)"
              fill="none"
              stroke="#4b616c"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              fillRule="evenodd"
            />
            <path
              id="Path_3723"
              data-name="Path 3723"
              d="M11.183,11.249,0,0"
              transform="translate(0.205 0.172)"
              fill="none"
              stroke="#4b616c"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              fillRule="evenodd"
            />
          </g>
        </svg>
      </button>
      {renderNumericButtons()}
      <button
        onClick={() => handlePageClick(currentPage + 1)}
        className="border-2 border-obsidianBlack rounded-xl bg-transparent rotate-180 hover:bg-[#0A1314]"
        disabled={currentPage === totalPages}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="19.862"
          height="19.862"
          viewBox="0 0 19.862 19.862"
        >
          <g
            id="_9041645_arrow_top_right_icon_1_"
            data-name="9041645_arrow_top_right_icon (1)"
            transform="translate(18.128 9.931) rotate(135)"
          >
            <path
              id="Path_3722"
              data-name="Path 3722"
              d="M11.593,0V11.593H0"
              transform="translate(0 0)"
              fill="none"
              stroke="#4b616c"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              fillRule="evenodd"
            />
            <path
              id="Path_3723"
              data-name="Path 3723"
              d="M11.183,11.249,0,0"
              transform="translate(0.205 0.172)"
              fill="none"
              stroke="#4b616c"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              fillRule="evenodd"
            />
          </g>
        </svg>
      </button>
    </nav>
  );
};

export default Pagination;

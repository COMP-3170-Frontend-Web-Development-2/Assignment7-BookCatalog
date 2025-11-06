import styles from "./book.module.css";

function Book({ book, onClick, onDetails }) {
    const {
        id,
        title,
        author,
        publisher,
        year,
        pages,
        language,
        image,
        url,
        onLoan = false,
        selected = false,
    } = book || {};

    function handleOpenDetails(e) {
        e.stopPropagation(); // prevent selecting the card
        onDetails?.({
            id,
            title,
            author,
            publisher,
            year,
            pages,
            language,
            url: url || image || "",
            image: image || url || "",
            onLoan,
            selected,
        });
    }

    return (
        <article
            className={`${styles.book} ${selected ? styles.selected : ""}`}
            onClick={onClick}
            role='button'
            tabIndex={0}
            aria-pressed={selected}>
            <div className={styles.book__imageContainer}>
                <img
                    className={styles.book__image}
                    src={image || url || ""}
                    alt={title || "Book cover"}
                    onError={(e) => {
                        e.currentTarget.src =
                            "https://via.placeholder.com/150x200?text=No+Image";
                    }}
                />
            </div>

            <div className={styles.book__content}>
                <h3 className={styles.book__title}>{title}</h3>

                {/* Status */}
                <span
                    className={`${styles.status} ${
                        onLoan ? styles.borrowed : styles.available
                    }`}>
                    {onLoan ? "Borrowed" : "Available"}
                </span>

                {/* Details */}
                <button
                    type='button'
                    className={styles.book__link}
                    onClick={handleOpenDetails}>
                    Details
                </button>
            </div>
        </article>
    );
}

export default Book;

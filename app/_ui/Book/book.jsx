import { useEffect, useState } from "react";
import styles from "./book.module.css";

function Book(props) {
    const b = props.book || props;

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
        selected,
    } = b || {};

    // When use props, allow selected state
    const isSelected = props.isSelected ?? selected ?? false;

    // To control the visibility of the book details
    const [showDetails, setShowDetails] = useState(false);

    // To store the list of similar books from the API
    const [similar, setSimilar] = useState([]);

    // To manage loading and error states for API calls
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Cover image/url
    const coverSrc = image || url;

    // When show details is not showing, dont show similar books
    // When show details is showing, show similar books by title
    useEffect(() => {
        if (!showDetails) return;

        let isCancelled = false;
        async function loadSimilar() {
            try {
                setLoading(true);
                setError("");

                //Similar books by title
                const q = encodeURIComponent(title || "");
                // Fetching API
                const res = await fetch(
                    `https://api.itbook.store/1.0/search/${q}`
                );
                // If doesnt work, throw error
                if (!res.ok) {
                    throw new Error(`Request failed: ${res.status}`);
                }
                // if not cancelled, set similar books in an array
                const data = await res.json();
                if (!isCancelled) {
                    setSimilar(Array.isArray(data.books) ? data.books : []);
                }
                //if error, show error message
            } catch (err) {
                if (!isCancelled) {
                    setError("Unable to load similar books right now.");
                }
                // loading is false when finishing the process
            } finally {
                if (!isCancelled) setLoading(false);
            }
        }
        // load similar books
        loadSimilar();
        return () => {
            isCancelled = true;
        };
    }, [showDetails, title]);

    // LISTING VIEW
    if (!showDetails) {
        return (
            <div
                className={`${styles.book} ${
                    isSelected ? styles.selected : ""
                }`}
                onClick={props.onClick}>
                <div className={styles.book__imageContainer}>
                    {/* Book cover image */}
                    <img
                        src={coverSrc}
                        alt={title || "Book cover"}
                        className={styles.book__image}
                    />
                </div>

                <div className={styles.book__content}>
                    {/* Book status */}
                    <span
                        className={`${styles.status} ${
                            onLoan ? styles.borrowed : styles.available
                        }`}>
                        {onLoan ? "Borrowed" : "Available"}
                    </span>

                    {/* Show details */}
                    <button
                        className={styles.book__link}
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowDetails(true);
                        }}
                        type='button'>
                        View details
                    </button>
                </div>
            </div>
        );
    }

    // DETAILS VIEW
    return (
        <div className={styles.detailsContainer}>
            <div className={styles.details}>
                {/* Cover */}
                <img
                    className={styles.cover}
                    src={coverSrc}
                    alt={`${title || "Book"} cover`}
                />

                {/* Details text */}
                <div className={styles.details_text}>
                    <h2 className={styles.title}>{title}</h2>
                    <p className={styles.book_info}>Author: {author}</p>
                    <p className={styles.book_info}>Publisher: {publisher}</p>
                    <p className={styles.book_info}>Year: {year}</p>
                    <p className={styles.book_info}>Pages: {pages}</p>
                    <p className={styles.book_info}>Language: {language}</p>

                    {/* close details */}
                    <button
                        className={styles.closeButton}
                        onClick={() => setShowDetails(false)}
                        type='button'>
                        Close
                    </button>
                </div>
            </div>

            {/* Similar books */}
            <div className={styles.similarSection}>
                <h3 className={styles.similarTitle}>Similar books</h3>

                {loading && <p className={styles.statusText}>Loading…</p>}
                {error && <p className={styles.errorText}>{error}</p>}

                {!loading && !error && (
                    <div className={styles.similarGrid}>
                        {similar.map((b) => (
                            <a
                                key={b.isbn13}
                                href={b.url}
                                target='_blank'
                                rel='noreferrer'
                                className={styles.similarItem}>
                                <img
                                    className={styles.similarImage}
                                    src={b.image}
                                    alt={b.title}
                                />
                                <div className={styles.similarMeta}>
                                    <p className={styles.similarName}>
                                        {b.title}
                                    </p>
                                    {b.price && (
                                        <p className={styles.similarPrice}>
                                            {b.price}
                                        </p>
                                    )}
                                </div>
                            </a>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Book;

import { useState, useEffect } from "react";
import { nanoid } from "nanoid";
import styles from "./homepage.module.css";
import Header from "../_ui/Header/header.jsx";
import Book from "../_ui/Book/book.jsx";
import Footer from "../_ui/Footer/footer.jsx";
import BookForm from "../_ui/BookForm/bookform.jsx";
import Modal from "../_ui/modal/modal.jsx";
import Button from "../_ui/Button/button.jsx";

function Homepage() {
    // To load books from localStorage or start empty
    const [books, setBooks] = useState(() => {
        const savedBooks = localStorage.getItem("books");
        return savedBooks ? JSON.parse(savedBooks) : [];
    });

    // To store loans
    const [loans, setLoans] = useState(() => {
        const saved = localStorage.getItem("loans");
        return saved ? JSON.parse(saved) : [];
    });

    // To switch view -  Catalog/Loan
    // (Extended: also supports "details" view now)
    const [view, setView] = useState("catalog");

    // Save books and loans to localStorage
    useEffect(() => {
        localStorage.setItem("books", JSON.stringify(books));
    }, [books]);

    useEffect(() => {
        localStorage.setItem("loans", JSON.stringify(loans));
    }, [loans]);

    // Filter by language
    const [filter, setFilter] = useState("");
    const languages = [
        ...new Set(books.map((b) => b?.language).filter(Boolean)),
    ];

    // Filtered list of books to be displayed
    const displayedBooks =
        filter === ""
            ? books
            : books.filter((book) => book.language === filter);

    // Add book
    function handleAddBook(bookData) {
        const newBook = {
            id: nanoid(),
            selected: false,
            title: bookData.title,
            author: bookData.author,
            publisher: bookData.publisher,
            year: bookData.year,
            language: bookData.language,
            pages: bookData.pages,
            image: bookData.url || "https://placehold.co/150x200",
            price: "$0.00",
            url: bookData.url || "#",
        };
        setBooks((prev) => [...prev, newBook]);
        if (bookData.onReset) bookData.onReset();
    }

    //  Edit book
    function handleEdit(updatedBook) {
        const selected = books.find((b) => b.selected);
        if (!selected) return;

        const edited = {
            ...selected,
            title: updatedBook?.title ?? selected.title,
            author: updatedBook?.author ?? selected.author,
            publisher: updatedBook?.publisher ?? selected.publisher,
            year: updatedBook?.year ?? selected.year,
            language: updatedBook?.language ?? selected.language,
            pages: updatedBook?.pages ?? selected.pages,
            image:
                updatedBook?.url ??
                selected.image ??
                "https://placehold.co/150x200",
            url: updatedBook?.url ?? selected.url,
        };
        setBooks((prev) =>
            prev.map((b) => (b.id === selected.id ? edited : b))
        );
    }

    // Delete book
    function handleDelete(id) {
        setBooks((prev) => prev.filter((b) => b.id !== id));
        setLoans((prev) => prev.filter((l) => l.bookId !== id));
        // If we are seeing the details of this book, go back to catalog
        if (detailsBook && detailsBook.id === id) {
            setDetailsBook(null);
            setView("catalog");
        }
    }

    // Select one book at a time
    function handleSelectBook(index) {
        setBooks((prev) =>
            prev.map((book, i) =>
                i === index
                    ? { ...book, selected: !book.selected }
                    : { ...book, selected: false }
            )
        );
    }

    // Currently selected book
    const selectedBook = books.find((b) => b.selected);

    // LOAN MANAGEMENT
    // Available books are those not currently on loan
    const availableBooks = books.filter(
        (b) => !loans.some((l) => l.bookId === b.id)
    );

    // Create a new loan
    function createLoan({ borrower, bookId, weeks }) {
        const nWeeks = Math.max(1, Math.min(4, Number(weeks || 1)));
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + nWeeks * 7);

        const newLoan = {
            id: nanoid(),
            borrower: borrower.trim(),
            bookId,
            weeks: nWeeks,
            dueDateISO: dueDate.toISOString(),
        };

        setLoans((prev) => [...prev, newLoan]);

        // If the loaned book is the one opened in details, mark as onLoan in the details view
        if (detailsBook && detailsBook.id === bookId) {
            setDetailsBook((prev) => (prev ? { ...prev, onLoan: true } : prev));
        }
    }

    // Return a loaned book (remove it from the list)
    function returnLoan(loanId) {
        const loan = loans.find((l) => l.id === loanId);
        setLoans((prev) => prev.filter((l) => l.id !== loanId));
        if (loan && detailsBook && detailsBook.id === loan.bookId) {
            setDetailsBook((prev) =>
                prev ? { ...prev, onLoan: false } : prev
            );
        }
    }

    //list of loaned books with book titles
    const loanedBooks = loans.map((loan) => {
        const book = books.find((b) => b.id === loan.bookId);
        return { ...loan, title: book?.title ?? "(deleted book)" };
    });

    // ===== DETAILS VIEW STATE (INSIDE HOMEPAGE) =====
    // To control the visibility of the book details
    // (We embed "details" as a view in Homepage, similar to "loans")
    const [detailsBook, setDetailsBook] = useState(null);

    // To store the list of similar books from the API
    const [similar, setSimilar] = useState([]);

    // To manage loading and error states for API calls
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // When show details is not showing, dont show similar books
    // When show details is showing, show similar books by title
    useEffect(() => {
        let isCancelled = false;

        async function loadSimilar() {
            if (view !== "details") return;
            if (!detailsBook?.title) return;

            try {
                setLoading(true);
                setError("");

                //Similar books by title
                const q = encodeURIComponent(detailsBook.title || "");

                // Fetching API
                const res = await fetch(
                    `https://api.itbook.store/1.0/search/${q}`
                );

                // If doesnt work, throw an error
                if (!res.ok) throw new Error(`Response status: ${res.status}`);

                const data = await res.json();
                if (!isCancelled) {
                    setSimilar(
                        Array.isArray(data?.books) ? data.books.slice(0, 6) : []
                    );
                }
            } catch (err) {
                if (!isCancelled)
                    setError(err?.message || "Failed to load similar books");
            } finally {
                if (!isCancelled) setLoading(false);
            }
        }

        // Reset when leaving details
        if (view !== "details") {
            setSimilar([]);
            setLoading(false);
            setError("");
        } else {
            loadSimilar();
        }

        return () => {
            isCancelled = true;
        };
    }, [view, detailsBook?.title]);

    // Open details from a book card
    function openDetails(bookObj) {
        // Mark current onLoan state from loans list
        const onLoan = loans.some((l) => l.bookId === bookObj.id);
        setDetailsBook({ ...bookObj, onLoan });
        setView("details");
    }

    return (
        <div className={styles.homepage}>
            {/*  Header  */}
            <Header />

            {/* Toolbar */}
            <div className={`${styles.toolbar} ${styles.toolbar__full}`}>
                <div className={styles.toolbar__left}>
                    {view === "catalog" && (
                        <button
                            className={styles.toolbar__loanBtn}
                            onClick={() => setView("loans")}>
                            Loans
                        </button>
                    )}

                    {view === "loans" && (
                        <button
                            className={styles.toolbar__loanBtn}
                            onClick={() => setView("catalog")}>
                            Back to Catalog
                        </button>
                    )}

                    {view === "details" && (
                        <button
                            className={styles.toolbar__loanBtn}
                            onClick={() => {
                                setDetailsBook(null);
                                setView("catalog");
                            }}>
                            Back to Catalog
                        </button>
                    )}
                </div>

                <div className={styles.toolbar__right}>
                    {view === "catalog" && (
                        <>
                            <label
                                className={styles.filter_label}
                                htmlFor='filter'>
                                Filter by language:
                            </label>
                            <select
                                id='filter'
                                className={styles.filter_select}
                                value={filter}
                                onChange={(e) => setFilter(e.target.value)}>
                                <option value=''>All</option>
                                {languages.map((lang) => (
                                    <option
                                        key={lang}
                                        value={lang}>
                                        {lang}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}
                </div>
            </div>

            <div className={styles.homepage__main}>
                {/* Catalog View */}
                {view === "catalog" && (
                    <main className={styles.main}>
                        {/* Buttons (Add / Edit / Delete) */}
                        <div className={styles.actions}>
                            {/* Add Book */}
                            <Modal
                                buttontitle='Add'
                                variant='add'>
                                {(close) => (
                                    <BookForm
                                        onSubmit={(data) => {
                                            handleAddBook({
                                                ...data,
                                                onReset: () => {},
                                            });
                                            close();
                                        }}
                                        submitLabel='Save'
                                    />
                                )}
                            </Modal>

                            {/* Edit Book */}
                            <Modal
                                buttontitle='Edit'
                                variant='edit'
                                disabled={!selectedBook}>
                                {(close) => (
                                    <BookForm
                                        initialBook={selectedBook}
                                        onSubmit={(data) => {
                                            handleEdit(data);
                                            close();
                                        }}
                                        submitLabel='Save'
                                    />
                                )}
                            </Modal>

                            {/* Delete Book */}
                            <Button
                                type='warning'
                                value='Delete'
                                size='small'
                                isDisabled={!selectedBook}
                                onClick={() =>
                                    selectedBook &&
                                    handleDelete(selectedBook.id)
                                }
                            />
                        </div>

                        {/* Grid of books */}
                        <div className={styles.grid}>
                            {displayedBooks.map((book, index) => {
                                const onLoan = loans.some(
                                    (l) => l.bookId === book.id
                                );
                                return (
                                    <Book
                                        key={book.id}
                                        book={{ ...book, onLoan }}
                                        onClick={() => handleSelectBook(index)}
                                        // NEW: open details view inside Homepage
                                        onDetails={(b) => openDetails(b)}
                                    />
                                );
                            })}
                        </div>
                    </main>
                )}

                {/* Loan View */}
                {view === "loans" && (
                    <main className={styles.mainLoans}>
                        <div className={styles.loans_panel}>
                            {/* Show form or message depending on availability */}
                            {availableBooks.length === 0 ? (
                                <div className={styles.no_available}>
                                    All books are currently on loan.
                                </div>
                            ) : (
                                <LoanForm
                                    books={availableBooks}
                                    onCreate={createLoan}
                                />
                            )}

                            {/* List of loaned books */}
                            <div className={styles.loans_list}>
                                <h3 className={styles.loans_title}>
                                    Loaned Books
                                </h3>
                                {loanedBooks.length === 0 ? (
                                    <p className={styles.loans_empty}>
                                        No books on loan.
                                    </p>
                                ) : (
                                    <ul className={styles.loan_items}>
                                        {loanedBooks.map((l) => (
                                            <li
                                                key={l.id}
                                                className={styles.loan_item}>
                                                <div
                                                    className={
                                                        styles.loan_text
                                                    }>
                                                    <strong>
                                                        {l.borrower}
                                                    </strong>{" "}
                                                    borrowed <em>{l.title}</em>
                                                    {" — due "}
                                                    {new Date(
                                                        l.dueDateISO
                                                    ).toLocaleDateString()}
                                                </div>
                                                <button
                                                    className={
                                                        styles.return_btn
                                                    }
                                                    onClick={() =>
                                                        returnLoan(l.id)
                                                    }>
                                                    Return
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </main>
                )}

                {/* Details View */}
                {view === "details" && detailsBook && (
                    <main className={styles.mainDetails}>
                        <div className={styles.details_container}>
                            <div className={styles.details_coverWrap}>
                                <img
                                    src={
                                        detailsBook.image ||
                                        detailsBook.url ||
                                        ""
                                    }
                                    alt={detailsBook.title || "Book cover"}
                                    onError={(e) => {
                                        e.currentTarget.src =
                                            "https://via.placeholder.com/240x320?text=No+Image";
                                    }}
                                />
                            </div>

                            <div className={styles.details_info}>
                                <h2 className={styles.details_title}>
                                    {detailsBook.title}
                                </h2>
                                <p className={styles.details_meta}>
                                    {detailsBook.author && (
                                        <span>
                                            Author: {detailsBook.author}
                                        </span>
                                    )}
                                    {detailsBook.publisher && (
                                        <>
                                            <span>
                                                Publisher:{" "}
                                                {detailsBook.publisher}
                                            </span>
                                        </>
                                    )}
                                    {detailsBook.year && (
                                        <>
                                            <span>
                                                Year: {detailsBook.year}
                                            </span>
                                        </>
                                    )}

                                    {detailsBook.language && (
                                        <span>
                                            Language: {detailsBook.language}
                                        </span>
                                    )}
                                    {detailsBook.pages && (
                                        <>
                                            <span>
                                                Number of pages:{" "}
                                                {detailsBook.pages} pages
                                            </span>
                                        </>
                                    )}
                                </p>

                                {/* simple status */}
                                <p
                                    className={
                                        (detailsBook.onLoan
                                            ? styles.statusLoaned
                                            : styles.statusAvailable) ?? ""
                                    }>
                                    {detailsBook.onLoan
                                        ? "Borrowed"
                                        : "Available"}
                                </p>
                            </div>
                        </div>

                        <div className={styles.similarBlock}>
                            <h3 className={styles.subheading}>Similar books</h3>

                            {loading && (
                                <p className={styles.helper}>Loading…</p>
                            )}
                            {error && (
                                <p className={styles.error}>Error: {error}</p>
                            )}

                            <ul className={styles.gridSimilar}>
                                {similar.map((s) => (
                                    <li
                                        key={s.isbn13}
                                        className={styles.similarCard}>
                                        <img
                                            src={s.image}
                                            alt={s.title}
                                            onError={(e) => {
                                                e.currentTarget.src =
                                                    "https://via.placeholder.com/120x160?text=No+Image";
                                            }}
                                        />
                                        <p className={styles.similarTitle}>
                                            {s.title}
                                        </p>
                                    </li>
                                ))}

                                {!loading && !error && similar.length === 0 && (
                                    <p className={styles.helper}>
                                        No similar titles found.
                                    </p>
                                )}
                            </ul>
                        </div>
                    </main>
                )}
            </div>

            {/* Footer  */}
            <Footer />
        </div>
    );
}

// component for creating a loan
function LoanForm({ books, onCreate }) {
    const [borrower, setBorrower] = useState("");
    const [bookId, setBookId] = useState(books[0]?.id ?? "");
    const [weeks, setWeeks] = useState(1);

    useEffect(() => {
        // If the selected book disappears from the list, reset the select field
        if (!books.find((b) => b.id === bookId)) {
            setBookId(books[0]?.id ?? "");
        }
    }, [books, bookId]);

    function handleSubmit(e) {
        e.preventDefault();
        if (!borrower.trim() || !bookId) return;
        onCreate({ borrower, bookId, weeks });
        setBorrower("");
    }

    return (
        <form
            onSubmit={handleSubmit}
            className={styles.loan_form}>
            <h3 className={styles.form_title}>Create a Loan</h3>

            {/* Borrower name */}
            <div className={styles.form_control}>
                <label
                    className={styles.form_label}
                    htmlFor='borrower'>
                    Borrower:
                </label>
                <input
                    id='borrower'
                    className={styles.form_input}
                    type='text'
                    value={borrower}
                    onChange={(e) => setBorrower(e.target.value)}
                    placeholder='Name'
                    required
                />
            </div>

            {/* Book selection */}
            <div className={styles.form_control}>
                <label
                    className={styles.form_label}
                    htmlFor='bookId'>
                    Book:
                </label>
                <select
                    id='bookId'
                    className={styles.form_input}
                    value={bookId}
                    onChange={(e) => setBookId(e.target.value)}
                    required>
                    {books.map((b) => (
                        <option
                            key={b.id}
                            value={b.id}>
                            {b.title}
                        </option>
                    ))}
                </select>
            </div>

            {/* Loan period */}
            <div className={styles.form_control}>
                <label
                    className={styles.form_label}
                    htmlFor='weeks'>
                    Loan period (weeks):
                </label>
                <input
                    id='weeks'
                    className={styles.form_input}
                    type='number'
                    min={1}
                    max={4}
                    value={weeks}
                    onChange={(e) => setWeeks(e.target.value)}
                    required
                />
            </div>

            {/* Submit button */}
            <button
                type='submit'
                className={styles.book_button}>
                Save Loan
            </button>
        </form>
    );
}

export default Homepage;

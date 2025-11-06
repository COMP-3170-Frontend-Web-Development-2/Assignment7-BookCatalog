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
    }

    // Return a loaned book (remove it from the list)
    function returnLoan(loanId) {
        setLoans((prev) => prev.filter((l) => l.id !== loanId));
    }

    //list of loaned books with book titles
    const loanedBooks = loans.map((loan) => {
        const book = books.find((b) => b.id === loan.bookId);
        return { ...loan, title: book?.title ?? "(deleted book)" };
    });

    return (
        <div className={styles.homepage}>
            {/*  Header  */}
            <Header />

            {/* Toolbar */}
            <div className={`${styles.toolbar} ${styles.toolbar__full}`}>
                <div className={styles.toolbar__left}>
                    {view === "catalog" ? (
                        <button
                            className={styles.toolbar__loanBtn}
                            onClick={() => setView("loans")}>
                            Loans
                        </button>
                    ) : (
                        <button
                            className={styles.toolbar__loanBtn}
                            onClick={() => setView("catalog")}>
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

import React from "react";
import styles from "./book.module.css";

function Book({ book, onClick }) {
    return (
        <div
            className={`${styles.book} ${book.selected ? styles.selected : ""}`}
            onClick={onClick}>
            <div className={styles.book__imageContainer}>
                <img
                    src={book.image}
                    alt={book.title}
                    className={styles.book__image}
                />
            </div>

            <div className={styles.book__content}>
                <span
                    className={`${styles.status} ${
                        book.onLoan ? styles.borrowed : styles.available
                    }`}>
                    {book.onLoan ? "Borrowed" : "Available"}
                </span>
                <p className={styles.book__price}>{book.price}</p>
                <a
                    href={book.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className={styles.book__link}>
                    View Details
                </a>
            </div>
        </div>
    );
}

export default Book;

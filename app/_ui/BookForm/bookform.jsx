import { useState, useEffect } from "react";
import styles from "./bookform.module.css";

function BookForm({ initialBook, onSubmit, submitLabel = "Save" }) {
    const [formData, setFormData] = useState({
        title: "",
        author: "",
        publisher: "",
        year: "",
        language: "",
        pages: "",
        url: "",
    });

    useEffect(() => {
        if (initialBook) {
            setFormData({
                title: initialBook.title ?? "",
                author: initialBook.author ?? "",
                publisher: initialBook.publisher ?? "",
                year: initialBook.year ?? "",
                language: initialBook.language ?? "",
                pages: initialBook.pages ?? "",
                url: initialBook.url ?? "",
            });
        } else {
            resetForm();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialBook]);

    function handleChange(e) {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // English note: On submit, we call the parent handler and,
    // if we're adding (not editing), we clear the form.
    function handleSubmit(e) {
        e.preventDefault();
        onSubmit?.(formData);
        if (!isEdit) resetForm(); // ✅ clear fields after adding
    }

    const isEdit = Boolean(initialBook);

    function resetForm() {
        setFormData({
            title: "",
            author: "",
            publisher: "",
            year: "",
            language: "",
            pages: "",
            url: "",
        });
    }

    return (
        <div className={styles.form_container}>
            <h2 className={styles.form_title}>
                {isEdit ? "Edit book" : "Add new book"}
            </h2>

            <form onSubmit={handleSubmit}>
                <div className={styles.form_control}>
                    <label
                        className={styles.form_label}
                        htmlFor='title'>
                        Title:
                    </label>
                    <input
                        className={styles.form_input}
                        type='text'
                        name='title'
                        value={formData.title}
                        onChange={handleChange}
                        placeholder='Title'
                        required
                    />
                </div>

                <div className={styles.form_control}>
                    <label
                        className={styles.form_label}
                        htmlFor='author'>
                        Author:
                    </label>
                    <input
                        className={styles.form_input}
                        type='text'
                        name='author'
                        value={formData.author}
                        onChange={handleChange}
                        placeholder='Author'
                        required
                    />
                </div>

                <div className={styles.form_control}>
                    <label
                        className={styles.form_label}
                        htmlFor='publisher'>
                        Publisher:
                    </label>
                    <input
                        className={styles.form_input}
                        type='text'
                        name='publisher'
                        value={formData.publisher}
                        onChange={handleChange}
                        placeholder='Publisher'
                    />
                </div>

                <div className={styles.form_control}>
                    <label
                        className={styles.form_label}
                        htmlFor='year'>
                        Year:
                    </label>
                    <input
                        className={styles.form_input}
                        type='number'
                        name='year'
                        value={formData.year}
                        onChange={handleChange}
                        placeholder='Year'
                    />
                </div>

                <div className={styles.form_control}>
                    <label
                        className={styles.form_label}
                        htmlFor='language'>
                        Language:
                    </label>
                    <input
                        className={styles.form_input}
                        type='text'
                        name='language'
                        value={formData.language}
                        onChange={handleChange}
                        placeholder='Language (e.g., English)'
                    />
                </div>

                <div className={styles.form_control}>
                    <label
                        className={styles.form_label}
                        htmlFor='pages'>
                        Number of pages:
                    </label>
                    <input
                        className={styles.form_input}
                        type='number'
                        name='pages'
                        value={formData.pages}
                        onChange={handleChange}
                        placeholder='Number of pages'
                    />
                </div>

                <div className={styles.form_control}>
                    <label
                        className={styles.form_label}
                        htmlFor='url'>
                        Book Cover URL:
                    </label>
                    <input
                        className={styles.form_input}
                        type='text'
                        name='url'
                        value={formData.url}
                        onChange={handleChange}
                        placeholder='https://example.com/cover.jpg'
                    />
                </div>

                <button
                    type='submit'
                    className={styles.book_button}>
                    {submitLabel}
                </button>
            </form>
        </div>
    );
}

export default BookForm;

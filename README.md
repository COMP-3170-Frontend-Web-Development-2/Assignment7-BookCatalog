# Assignment 7 - Data fetching

## Instructions

Update the Book Catalog app to display a book details screen as described below:

-   update the Book component to include a button which, when clicked, swaps out the book listing view for a book details view
-   the book details view show the book's cover image alongside detailed information including title, author, publisher, publication year, page count, etc.
-   the component then loads a list of similar books from an external API and displays them below the book's details
    -   use the https://api.itbook.store/ API.
    -   you can provide a query to the API to search for books matching the query
    -   e.g.: https://api.itbook.store/1.0/search/{query} where query is a search string you provide (such as publisher, author or title)
-   the component should also render a button for dismissing the book details view

Here is a live example: https://yveshema.github.io/comp3170-book-catalog-v7/

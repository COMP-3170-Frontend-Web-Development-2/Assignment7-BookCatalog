import styles from "./footer.module.css";

function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className={styles.footer}>
            <p className={styles.footer__text}>
                © {currentYear} Book Catalog. By Bruna Guarizo.
            </p>
        </footer>
    );
}

export default Footer;

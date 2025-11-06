import styles from "./header.module.css";

function Header() {
    return (
        <header className={styles.header}>
            <div className={styles.header__logo}>
                <svg
                    className={styles.header__icon}
                    width='32'
                    height='32'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'>
                    <path
                        d='M4 19.5A2.5 2.5 0 0 1 6.5 17H20'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                    />
                    <path
                        d='M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z'
                        stroke='currentColor'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                    />
                    <path
                        d='M8 6h8M8 10h8M8 14h5'
                        stroke='currentColor'
                        strokeWidth='1.5'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                    />
                </svg>
                <span className={styles.header__title}>Book Catalog</span>
            </div>
        </header>
    );
}

export default Header;

import styles from "./button.module.css";

function Button({
    type = "primary",
    isDisabled = false,
    size,
    value,
    onClick,
}) {
    const classes = [
        styles.button,
        size === "small" && styles.small,
        size === "large" && styles.large,
        type === "primary" && styles.primary,
        type === "secondary" && styles.secondary,
        type === "terciary" && styles.terciary,
        type === "warning" && styles.error,
        isDisabled && styles.isDisabled,
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <button
            type='button'
            className={classes}
            disabled={isDisabled}
            aria-disabled={isDisabled}
            onClick={onClick}
            title={value}>
            {value}
        </button>
    );
}

export default Button;

const Maintenance = () => {
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>🚧 Web App vaqtincha yopiq</h1>
        <p style={styles.text}>
          Hozirda sayt ta’mirlanmoqda. <br />
          Savdolar uchun Telegram botdan foydalaning 👇
        </p>

        <a
          href="https://t.me/tezpremiumbot"
          target="_blank"
          rel="noreferrer"
          style={styles.button}
        >
          🤖 Telegram Botga o‘tish
        </a>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #0f2027, #203a43, #2c5364)",
    padding: 20,
  },
  card: {
    background: "#111",
    padding: "40px",
    borderRadius: "16px",
    textAlign: "center",
    maxWidth: "420px",
    boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
  },
  title: {
    color: "#fff",
    marginBottom: "16px",
  },
  text: {
    color: "#ccc",
    marginBottom: "24px",
    lineHeight: 1.6,
  },
  button: {
    display: "inline-block",
    padding: "12px 24px",
    borderRadius: "10px",
    background: "#1da1f2",
    color: "#fff",
    textDecoration: "none",
    fontWeight: "bold",
  },
};

export default Maintenance;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/users/sign-in", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          (data && (data.message || data.error)) ||
          "Ошибка входа";
        throw new Error(message);
      }

      // После успешного входа редирект на страницу пользователя
      if (data.user_id) {
        setTimeout(() => {
          navigate(`/users/${data.user_id}`);
        }, 100);
      } else {
        setError("Не удалось получить ID пользователя");
      }
    } catch (err) {
      setError(err.message || "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <h2>Вход</h2>
      <div className="field">
        <label htmlFor="login-email">Почта</label>
        <input
          id="login-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@mail.com"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="login-password">Пароль</label>
        <input
          id="login-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Введите пароль"
          required
        />
      </div>

      <button className="button" type="submit" disabled={loading}>
        {loading ? "Вход..." : "Войти"}
      </button>

      {error && <div className="alert alert-error">{error}</div>}
    </form>
  );
}

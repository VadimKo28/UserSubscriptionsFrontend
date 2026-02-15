import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const INITIAL_STATE = {
  name: "",
  email: "",
  password: ""
};

export function UserCreateForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const response = await fetch("/users/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include", // Важно для отправки cookies
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password
        })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          (data && (data.message || data.error)) ||
          "Произошла ошибка при создании пользователя";
        throw new Error(message);
      }

      // Backend пишет access_token и refresh_token в cookies (HttpOnly)
      // Браузер автоматически отправит эти cookies с последующими запросами при credentials: "include"
      // Небольшая задержка перед редиректом, чтобы cookie успела установиться
      setTimeout(() => {
        navigate(`/users/${data.user_id}`);
      }, 100);
    } catch (err) {
      setError(err.message || "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="name">Имя</label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="Введите имя"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="email">Почта</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          placeholder="example@mail.com"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="password">Пароль</label>
        <input
          id="password"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Введите пароль"
          required
        />
      </div>

      <button className="button" type="submit" disabled={loading}>
        {loading ? "Отправка..." : "Создать пользователя"}
      </button>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
    </form>
  );
}


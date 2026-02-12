import React, { useState } from "react";

const INITIAL_STATE = {
  name: "",
  email: "",
  password: ""
};

export function UserCreateForm() {
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
      const response = await fetch("http://localhost:8081/users/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
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

      setSuccess("Пользователь успешно создан");
      setForm(INITIAL_STATE);
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


import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";

// Компонент формы создания подписки
function SubscriptionCreateForm({ userId, onSuccess }) {
  const [serviceName, setServiceName] = useState("");
  const [price, setPrice] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Преобразуем price в целое число (int)
      const priceInt = parseInt(price, 10);
      if (isNaN(priceInt) || priceInt <= 0) {
        throw new Error("Цена должна быть положительным целым числом");
      }

      // Форматируем даты в формат YYYY-MM (год-месяц)
      // Если используется input type="month", значение уже в формате YYYY-MM
      // Если используется input type="date", нужно преобразовать YYYY-MM-DD в YYYY-MM
      const formatDateToMonth = (dateStr) => {
        if (!dateStr) return "";
        // Если уже в формате YYYY-MM, возвращаем как есть
        if (/^\d{4}-\d{2}$/.test(dateStr)) {
          return dateStr;
        }
        // Если в формате YYYY-MM-DD, обрезаем до YYYY-MM
        if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
          return dateStr.substring(0, 7); // Берем первые 7 символов (YYYY-MM)
        }
        return dateStr;
      };

      const response = await fetch(`/api/users/${userId}/subscriptions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          service_name: serviceName,
          price: priceInt, // Отправляем как целое число (int)
          start_date: formatDateToMonth(startDate), // Формат YYYY-MM
          end_date: formatDateToMonth(endDate) // Формат YYYY-MM
        })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        // Пытаемся извлечь детальное сообщение об ошибке
        let message = "Произошла ошибка при создании подписки";
        if (data) {
          if (data.message) {
            message = data.message;
          } else if (data.error) {
            message = data.error;
          } else if (typeof data === "string") {
            message = data;
          }
        }
        throw new Error(message);
      }

      setSuccess("Подписка успешно создана");
      setServiceName("");
      setPrice("");
      setStartDate("");
      setEndDate("");
      
      // Перезагружаем список подписок
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          setSuccess("");
        }, 1000);
      }
    } catch (err) {
      setError(err.message || "Неизвестная ошибка");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="subscription-form" onSubmit={handleSubmit}>
      <div className="subscription-form-fields">
        <div className="field">
          <label htmlFor="service_name">Название сервиса</label>
          <input
            id="service_name"
            type="text"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            placeholder="Название сервиса"
            required
            className="subscription-input"
          />
        </div>
        <div className="field">
          <label htmlFor="price">Цена (руб.)</label>
          <input
            id="price"
            type="number"
            step="1"
            min="1"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Цена"
            required
            className="subscription-input"
          />
        </div>
        <div className="field">
          <label htmlFor="start_date">Месяц начала</label>
          <input
            id="start_date"
            type="month"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="subscription-input"
          />
        </div>
        <div className="field">
          <label htmlFor="end_date">Месяц окончания</label>
          <input
            id="end_date"
            type="month"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="subscription-input"
          />
        </div>
      </div>
      <button type="submit" disabled={loading} className="subscription-button">
        {loading ? "Создание..." : "Создать подписку"}
      </button>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}
    </form>
  );
}

export function UserPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subscriptionsLoading, setSubscriptionsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Функция для загрузки подписок
  const loadSubscriptions = useCallback(() => {
    setSubscriptionsLoading(true);
    fetch(`/api/users/${id}/subscriptions`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Требуется авторизация");
          }
          if (res.status === 404) {
            return [];
          }
          throw new Error("Ошибка загрузки подписок");
        }
        return res.json();
      })
      .then((data) => {
        const subs = Array.isArray(data) ? data : (data.subscriptions || []);
        setSubscriptions(subs);
      })
      .catch((err) => {
        if (err.message.includes("авторизация")) {
          setError(err.message);
        }
      })
      .finally(() => {
        setSubscriptionsLoading(false);
      });
  }, [id]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSubscriptionsLoading(true);
    setError("");

    // Загружаем данные пользователя
    fetch(`/api/users/${id}`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Требуется авторизация");
          }
          throw new Error("Пользователь не найден");
        }
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setUser(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Ошибка загрузки");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Загружаем подписки пользователя
    fetch(`/api/users/${id}/subscriptions`, {
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      }
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 401) {
            throw new Error("Требуется авторизация");
          }
          // Если подписки не найдены, возвращаем пустой массив
          if (res.status === 404) {
            return [];
          }
          throw new Error("Ошибка загрузки подписок");
        }
        return res.json();
      })
      .then((data) => {
        // Ожидаем массив подписок или объект с полем subscriptions
        const subs = Array.isArray(data) ? data : (data.subscriptions || []);
        if (!cancelled) setSubscriptions(subs);
      })
      .catch((err) => {
        // Не показываем ошибку для подписок, если это не 401
        if (!cancelled && err.message.includes("авторизация")) {
          setError(err.message);
        }
      })
      .finally(() => {
        if (!cancelled) setSubscriptionsLoading(false);
      });

    return () => { cancelled = true; };
  }, [id]);

  if (loading) return <div className="card">Загрузка...</div>;
  if (error) {
    return (
      <div className="card">
        <div className="alert alert-error">{error}</div>
        <Link to="/" className="link">На главную</Link>
      </div>
    );
  }
  if (!user) return null;

  return (
    <div className="card">
      <h2>Пользователь</h2>
      <dl className="user-details">
        <dt>Имя</dt>
        <dd>{(user.name ?? user.Name) ?? "—"}</dd>
        <dt>Почта</dt>
        <dd>{(user.email ?? user.Email) ?? "—"}</dd>
      </dl>

      <div className="subscriptions-section">
        <h3>Подписки</h3>
        
        <SubscriptionCreateForm userId={id} onSuccess={loadSubscriptions} />
        
        {subscriptionsLoading ? (
          <div>Загрузка подписок...</div>
        ) : subscriptions.length === 0 ? (
          <div className="no-subscriptions">Нет подписок</div>
        ) : (
          <ul className="subscriptions-list">
            {subscriptions.map((subscription, index) => {
              const serviceName = subscription.service_name || subscription.ServiceName || subscription.serviceName || "—";
              const price = subscription.price || subscription.Price || subscription.Price || "—";
              const startDate = subscription.start_date || subscription.StartDate || subscription.startDate || "—";
              const endDate = subscription.end_date || subscription.EndDate || subscription.endDate || "—";
              
              // Форматируем даты для отображения (формат YYYY-MM)
              const formatDate = (dateStr) => {
                if (dateStr === "—") return "—";
                try {
                  // Если формат YYYY-MM, парсим и форматируем
                  if (/^\d{4}-\d{2}$/.test(dateStr)) {
                    const [year, month] = dateStr.split("-");
                    const date = new Date(parseInt(year), parseInt(month) - 1);
                    return date.toLocaleDateString("ru-RU", { year: "numeric", month: "long" });
                  }
                  // Если другой формат, пытаемся распарсить
                  const date = new Date(dateStr);
                  return date.toLocaleDateString("ru-RU", { year: "numeric", month: "long" });
                } catch {
                  return dateStr;
                }
              };

              // Форматируем цену для отображения (целое число)
              const formatPrice = (priceValue) => {
                if (priceValue === "—") return "—";
                const numPrice = parseInt(priceValue, 10);
                if (isNaN(numPrice)) return priceValue;
                return new Intl.NumberFormat("ru-RU", {
                  style: "currency",
                  currency: "RUB",
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0
                }).format(numPrice);
              };

              return (
                <li key={subscription.id || subscription.Id || index} className="subscription-item">
                  <div className="subscription-content">
                    <div className="subscription-header">
                      <span className="subscription-service">{serviceName}</span>
                      <span className="subscription-price">{formatPrice(price)}</span>
                    </div>
                    <div className="subscription-dates">
                      <span className="subscription-date">
                        <strong>Начало:</strong> {formatDate(startDate)}
                      </span>
                      <span className="subscription-date">
                        <strong>Окончание:</strong> {formatDate(endDate)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Link to="/" className="link">На главную</Link>
    </div>
  );
}

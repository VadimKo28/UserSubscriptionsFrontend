import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { LoginForm } from "./LoginForm.jsx";
import { UserCreateForm } from "./UserCreateForm.jsx";
import { UserPage } from "./pages/UserPage.jsx";

function App() {
  return (
    <div className="app">
      <Routes>
        <Route
          path="/"
          element={
            <>
              <h1>Вход в систему</h1>
              <LoginForm />
              <div style={{ marginTop: "16px", textAlign: "center" }}>
                <Link to="/sign-up" className="link-button">
                  Создать нового пользователя
                </Link>
              </div>
            </>
          }
        />
        <Route
          path="/sign-up"
          element={
            <>
              <h1>Создание нового пользователя</h1>
              <UserCreateForm />
            </>
          }
        />
        <Route path="/users/:id" element={<UserPage />} />
      </Routes>
    </div>
  );
}

export default App;


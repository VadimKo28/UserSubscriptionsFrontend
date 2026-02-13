import React from "react";
import { Routes, Route } from "react-router-dom";
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


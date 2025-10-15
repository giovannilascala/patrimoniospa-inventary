"use client";

import Navbar from "@/components/Navbar";
import { useState } from "react";

export default function LoginPage() {
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login:", formData);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-100 font-[Nunito_Sans]">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-3xl p-16 w-full max-w-xl shadow-xl flex flex-col gap-12"
        >
          {/* Titolo */}
          <h1 className="text-5xl font-light text-gray-800 text-center">
            Accedi
          </h1>

          {/* Username */}
          <div className="flex flex-col relative">
            <input
              type="text"
              id="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              required
              className="peer w-full rounded-xl border border-gray-300 px-5 p-4 text-gray-900 text-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-transparent"
            />

          </div>

          {/* Password */}
          <div className="flex flex-col relative">
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              required
              className="peer w-full rounded-xl border border-gray-300 px-5 p-4 text-gray-900 text-2xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all bg-transparent"
            />

          </div>

          {/* Pulsante */}
          <button
            type="submit"
            className="py-5 px-8 bg-blue-600 text-white text-3xl font-light rounded-xl shadow-sm hover:bg-blue-700 transition-all duration-200"
          >
            Accedi
          </button>


        </form>
      </div>
    </>
  );
}

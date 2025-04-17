import React, { useEffect, useState } from 'react';

const Login = () => {
  const [animationComplete, setAnimationComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 500); 

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-800 min-h-screen flex items-center justify-center px-4 text-white">
      <div
        id="loginBox"
        className={`w-full max-w-md p-8 rounded-2xl bg-gray-900 shadow-2xl border border-gray-800 transform transition-all duration-1000 ${
          animationComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
        }`}
      >
        <h1 className="text-3xl font-extrabold mb-6 text-center text-pink-400 tracking-wide">
          🔐 Welcome Back
        </h1>

        <form action="/" method="POST" className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:ring-2 focus:ring-pink-500 focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-300 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-800 text-white placeholder-gray-500 border border-gray-700 focus:ring-2 focus:ring-pink-500 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-pink-500 text-white font-semibold"
          >
            Login
          </button>
          <a
            href="/register"
            className="w-full py-3 rounded-lg  text-white font-semibold"
          >
            Don't have an account?{' '}
            <span className="text-pink-500">Register</span>
          </a>
        </form>
      </div>

      {/* Input and button fade-in animation */}
      {/* <div
        className={`transform transition-all duration-1000 delay-300 ${
          animationComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
        }`}
      >
        
      </div> */}
    </div>
  );
};

export default Login;

import React, { useState } from 'react';
import { useCRM } from '../context/CRMContext';
import { ShieldCheck, UserPlus, LogIn, TrendingUp, Users } from 'lucide-react';

export default function LoginView() {
  const { login, users, registerUser } = useCRM();
  
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  
  // Registration form
  const [showRegister, setShowRegister] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<'Administrator' | 'Sales Manager' | 'Sales Representative'>('Sales Representative');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    const success = login(email);
    if (!success) {
      setError('Email not found. Try choosing one of the demo users below or register a new account.');
    } else {
      setError('');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) {
      setError('Name and Email are required.');
      return;
    }
    // Simple email validation pattern
    if (!newEmail.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    
    registerUser(newName, newEmail, newRole);
    login(newEmail);
    setError('');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-2 mb-2">
          <div className="bg-blue-600 text-white p-2 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <TrendingUp className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold text-gray-900 tracking-tight font-sans">
            Sales<span className="text-blue-600">Hub</span>
          </span>
        </div>
        <p className="text-center text-xs text-gray-500 tracking-wider uppercase font-semibold">
          Enterprise CRM Engine
        </p>
        <h2 className="mt-4 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          {showRegister ? 'Create corporate account' : 'Welcome to SalesHub'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {showRegister ? (
            <span>
              Already registered?{' '}
              <button
                onClick={() => { setShowRegister(false); setError(''); }}
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors cursor-pointer"
              >
                Sign in to your space
              </button>
            </span>
          ) : (
            <span>
              Or{' '}
              <button
                onClick={() => { setShowRegister(true); setError(''); }}
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors cursor-pointer animate-pulse"
              >
                register a new colleague account
              </button>
            </span>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-100">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 text-sm text-red-700 rounded-r-lg">
              {error}
            </div>
          )}

          {!showRegister ? (
            <form className="space-y-6" onSubmit={handleLoginSubmit}>
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
                  Corporate Email
                </label>
                <div className="mt-1 relative rounded-md shadow-xs">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="alex.rivera@saleshub.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm text-gray-900"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-xs text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <LogIn className="h-4 w-4" /> Sign In
                </button>
              </div>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleRegisterSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  placeholder="E.g. Sarah Connor"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="mt-1 appearance-none block w-full px-4 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-sm font-semibold text-gray-700">
                  Corporate Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="s.connor@saleshub.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="mt-1 appearance-none block w-full px-4 py-2.5 border border-gray-300 rounded-xl placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Operational Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="mt-1 block w-full pl-3 pr-10 py-2.5 text-sm border-gray-300 focus:outline-hidden focus:ring-blue-500 focus:border-blue-500 rounded-xl text-gray-700"
                >
                  <option value="Sales Representative">Sales Representative</option>
                  <option value="Sales Manager">Sales Manager</option>
                  <option value="Administrator">Administrator (Lead)</option>
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-xs text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all cursor-pointer"
                >
                  <UserPlus className="h-4 w-4" /> Create & Launch Portal
                </button>
              </div>
            </form>
          )}

          {/* Quick Demo Access Options */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest block mb-4 text-center">
              Quick access demo keys
            </span>
            <div className="space-y-2.5">
              {users.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => {
                    login(u.email);
                    setError('');
                  }}
                  className="w-full flex items-center justify-between p-3 border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 rounded-xl transition-all cursor-pointer text-left group"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-gray-100 group-hover:ring-blue-200 transition-all"
                      src={u.avatarUrl}
                      alt={u.name}
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {u.name}
                      </p>
                      <p className="text-xs text-gray-500 font-mono">
                        {u.email}
                      </p>
                    </div>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-2xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    {u.role}
                  </span>
                </button>
              ))}
            </div>
            
            <div className="mt-6 flex items-center justify-center space-x-1.5 text-2xs text-gray-400 bg-gray-50 p-2.5 rounded-lg border border-dashed border-gray-200">
              <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
              <span>Session data is stored secure and private in LocalStorage</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

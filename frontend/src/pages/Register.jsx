import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, Loader2, ArrowRight } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Member',
    adminEmail: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const success = await register(formData.name, formData.email, formData.password, formData.role, formData.adminEmail);
    setIsSubmitting(false);
    if (success) {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Pane - Visuals */}
      <div className="hidden lg:flex lg:w-1/2 bg-mesh relative items-center justify-center overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-4000"></div>
        
        <div className="relative z-10 glass p-12 rounded-3xl max-w-lg mx-auto text-center transform hover:scale-105 transition-transform duration-500">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center">
              <CheckSquare className="w-10 h-10 text-primary-600" />
            </div>
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Join TaskFlow Pro</h2>
          <p className="text-lg text-gray-600 mb-8">
            Empower your team to achieve more together. Fast, intuitive, and beautiful.
          </p>
          <div className="flex justify-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary-300"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-primary-600"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-primary-300"></span>
          </div>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white px-8 sm:px-12 lg:px-24">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create an account</h2>
            <p className="mt-2 text-sm text-gray-500">
              Start managing your projects in seconds.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all shadow-sm"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all shadow-sm"
                  placeholder="Enter your email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength="6"
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all shadow-sm"
                  placeholder="Create a secure password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="block w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white transition-all shadow-sm appearance-none"
                >
                  <option value="Member">Team Member</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>

              {formData.role === 'Member' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Admin's Email <span className="text-red-500">*</span></label>
                  <input
                    name="adminEmail"
                    type="email"
                    required
                    value={formData.adminEmail}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 bg-indigo-50/50 border border-indigo-100 rounded-xl text-gray-900 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm"
                    placeholder="e.g. admin@yourcompany.com"
                  />
                  <p className="mt-1 text-xs text-gray-500">Provide the email of the Admin whose workspace you are joining.</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3.5 px-4 mt-2 border border-transparent rounded-xl shadow-md text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-200 group"
            >
              {isSubmitting ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-500 transition-colors">
              Sign in instead
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

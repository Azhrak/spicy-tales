import { createFileRoute, Link } from '@tanstack/react-router'
import { Heart, BookOpen, User, LogOut } from 'lucide-react'

export const Route = createFileRoute('/browse')({
  component: BrowsePage,
})

function BrowsePage() {
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      window.location.href = '/'
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-romance-50 via-white to-romance-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="w-8 h-8 text-romance-600" fill="currentColor" />
            <span className="text-xl font-bold text-slate-900">Spicy Tales</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              to="/browse"
              className="text-slate-700 hover:text-romance-600 font-medium"
            >
              Browse
            </Link>
            <Link
              to="/library"
              className="text-slate-700 hover:text-romance-600 font-medium"
            >
              My Library
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-slate-700 hover:text-romance-600 font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 mb-4">
              Choose Your Romance Adventure
            </h1>
            <p className="text-lg text-slate-600">
              Select a story template and start your personalized journey
            </p>
          </div>

          {/* Coming Soon Message */}
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <BookOpen className="w-16 h-16 text-romance-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Novel Templates Coming Soon
            </h2>
            <p className="text-slate-600 mb-6">
              We're preparing an amazing collection of romance novel templates for you.
              Each story will be uniquely generated based on your preferences!
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <div className="px-4 py-2 bg-romance-50 border border-romance-200 rounded-lg">
                <span className="text-romance-700 font-medium">CEO Romance</span>
              </div>
              <div className="px-4 py-2 bg-romance-50 border border-romance-200 rounded-lg">
                <span className="text-romance-700 font-medium">Paranormal</span>
              </div>
              <div className="px-4 py-2 bg-romance-50 border border-romance-200 rounded-lg">
                <span className="text-romance-700 font-medium">Second Chance</span>
              </div>
              <div className="px-4 py-2 bg-romance-50 border border-romance-200 rounded-lg">
                <span className="text-romance-700 font-medium">Time Travel</span>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="text-3xl font-bold text-romance-600 mb-2">4</div>
              <div className="text-slate-600">Novel Templates</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="text-3xl font-bold text-romance-600 mb-2">∞</div>
              <div className="text-slate-600">Unique Stories</div>
            </div>
            <div className="bg-white rounded-xl shadow p-6 text-center">
              <div className="text-3xl font-bold text-romance-600 mb-2">3</div>
              <div className="text-slate-600">Choices Per Scene</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

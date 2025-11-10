
import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {Home, MapPin, BookOpen, Users, Calendar, LogOut, Menu, X, UserCircle, Shield, User} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const { user, isAdmin, signOut } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/', icon: Home, adminOnly: false },
    { name: 'Salas', href: '/salas', icon: MapPin, adminOnly: false },
    { name: 'Disciplinas', href: '/disciplinas', icon: BookOpen, adminOnly: false },
    { name: 'Turmas', href: '/turmas', icon: Users, adminOnly: false },
    { name: 'Grade Horária', href: '/grade', icon: Calendar, adminOnly: false },
    { name: 'Meu Perfil', href: '/profile', icon: User, adminOnly: false },
    { name: 'Usuários', href: '/users', icon: UserCircle, adminOnly: true }
  ].filter(item => !item.adminOnly || isAdmin)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-blue-600">
                  Sistema Acadêmico
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm">
                {isAdmin && <Shield className="text-purple-600" size={16} />}
                <span className="text-gray-700 font-medium">{user?.userName}</span>
                <span className={`px-2 py-1 rounded-full text-xs ${isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                  {isAdmin ? 'Admin' : 'Usuário'}
                </span>
              </div>
              <button onClick={signOut} className="hidden md:flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors">
                <LogOut size={18} />
                <span className="text-sm">Sair</span>
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-gray-600">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Desktop */}
        <nav className="hidden md:block w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                const Icon = item.icon
                
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)}>
            <nav className="absolute left-0 top-16 bottom-0 w-64 bg-white shadow-lg" onClick={(e) => e.stopPropagation()}>
              <div className="p-4">
                <div className="mb-4 pb-4 border-b">
                  <div className="flex items-center gap-2 mb-2">
                    {isAdmin && <Shield className="text-purple-600" size={16} />}
                    <span className="text-gray-700 font-medium">{user?.userName}</span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${isAdmin ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                    {isAdmin ? 'Administrador' : 'Usuário'}
                  </span>
                </div>
                <ul className="space-y-2">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href
                    const Icon = item.icon
                    return (
                      <li key={item.name}>
                        <Link to={item.href} onClick={() => setMobileMenuOpen(false)} className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}>
                          <Icon className="mr-3 h-5 w-5" />
                          {item.name}
                        </Link>
                      </li>
                    )
                  })}
                </ul>
                <button onClick={signOut} className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <LogOut size={18} />
                  Sair do Sistema
                </button>
              </div>
            </nav>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout

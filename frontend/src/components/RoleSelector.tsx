import { useState } from 'react'
import type { UserRole, RoleInfo } from '../types'

interface RoleSelectorProps {
  currentRole: UserRole
  onRoleChange: (role: UserRole) => void
}

const roleOptions: RoleInfo[] = [
  {
    id: 'clinician',
    name: 'Dr. Aisha (Clinician)',
    description: 'Patient care and clinical decision-making',
    icon: '👩‍⚕️'
  },
  {
    id: 'analyst',
    name: 'Siti (Analyst)',
    description: 'Population health and data analytics',
    icon: '📊'
  },
  {
    id: 'admin',
    name: 'System Admin',
    description: 'System management and user administration',
    icon: '🔧'
  }
]

export default function RoleSelector({ currentRole, onRoleChange }: RoleSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const currentRoleInfo = roleOptions.find(role => role.id === currentRole)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
      >
        <span className="text-xl">{currentRoleInfo?.icon}</span>
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-gray-900">
            {currentRoleInfo?.name}
          </span>
          <span className="text-xs text-gray-500">
            {currentRoleInfo?.description}
          </span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 z-20 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            <div className="py-1">
              {roleOptions.map((role) => (
                <button
                  key={role.id}
                  onClick={() => {
                    onRoleChange(role.id)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    currentRole === role.id
                      ? 'bg-blue-50 border-r-2 border-blue-500'
                      : ''
                  }`}
                >
                  <span className="text-xl">{role.icon}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">
                      {role.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {role.description}
                    </span>
                  </div>
                  {currentRole === role.id && (
                    <div className="ml-auto">
                      <svg
                        className="w-4 h-4 text-blue-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            {/* Role Switching Notice */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
              <p className="text-xs text-gray-600">
                <span className="font-medium">Note:</span> Switching roles will update the canvas layout and available tools.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
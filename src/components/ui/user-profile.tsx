'use client'

import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from './avatar'
import { Button } from './button'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './dropdown-menu'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  name: string | null
  email: string | null
  image: string | null
}

export function UserProfileButton() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Fetch user data from your API/auth service
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (!response.ok) throw new Error('Failed to fetch user profile')
        const data = await response.json()
        setUser(data)
      } catch (error) {
        console.error('Error fetching user profile:', error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const handleSignOut = async () => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' })
      router.push('/auth/signin')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  if (isLoading) {
    return (
      <Button variant="ghost" className="w-full justify-start" disabled>
        <Avatar className="h-6 w-6 mr-2">
          <AvatarFallback>...</AvatarFallback>
        </Avatar>
        Loading...
      </Button>
    )
  }

  if (!user) {
    return (
      <Button 
        variant="ghost" 
        className="w-full justify-start"
        onClick={() => router.push('/auth/signin')}
      >
        <Avatar className="h-6 w-6 mr-2">
          <AvatarFallback>?</AvatarFallback>
        </Avatar>
        Sign In
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          <Avatar className="h-6 w-6 mr-2">
            {user.image ? (
              <AvatarImage src={user.image} alt={user.name || 'User avatar'} />
            ) : (
              <AvatarFallback>
                {user.name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'}
              </AvatarFallback>
            )}
          </Avatar>
          <span className="truncate">
            {user.name || user.email || 'Unknown User'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[200px]">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push('/profile')}>
          Profile Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push('/dashboard')}>
          Dashboard
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600">
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 
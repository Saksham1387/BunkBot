'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from 'axios'

interface SignInFormProps {
  onSuccess: () => void
}

export default function SignInForm({ onSuccess }: SignInFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/v1/signin`,{
        username:email,
        password
    })
    console.log(res.data)
    console.log(res.status)

    if(res.status == 200){
        console.log(res.data)
        localStorage.setItem("token",res.data.token)
        localStorage.setItem("user",res.data.user.username)

        console.log('Signing up with:', email, password)
        onSuccess()
    }
    console.log("rerrr")
    // Here you would typically make an API call to register the user
    
  }

  return (
    <div>
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full">Sign In</Button>
    </form>
    </div>
  )
}


'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import axios from 'axios'

interface SignUpFormProps {
  onSuccess: () => void
}

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert("Passwords don't match!")
      return
    }
    const res = await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/v1/signup`,{
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
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full">Sign Up</Button>
    </form>
  )
}





// 1: {"id":"3ac14d7e25da1476577e5d3469a460cabc63120b","bound":null}
// 2: {"id":"ce3c1ba14ec2889106e9536302f2b7cd9c4b629b","bound":null}
// 0: [{"action":"$F1","options":{"onSetAIState":"$F2"}},{"chatId":"ilR243e","messages":[],"allQueries":[],"lastShownItemIndex":{},"itemsLikedByUserOldestFirst":[]},{"content":"blue jeans","userId":"$undefined","currentUserPlan":{"id":"free","name":"Free","description":"Free forever, for people who like to browse items casually","price":"$$0","features":["2000 daily product recommendations","Use our basic fashion model built on top of GPT-4o Mini","Favorite items and view past searches"],"nonFeatures":["Only 2 daily hidden gems search","Image upload functionality","Email or chat support"]},"savedUserPreferences":{}}]



// Paykddfsdf25smxccvlkfc&123+*
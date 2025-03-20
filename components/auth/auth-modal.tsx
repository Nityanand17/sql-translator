"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import LoginForm from "./login-form"
import SignupForm from "./signup-form"

type AuthModalProps = {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)

  // Reset to login view when modal is closed
  useEffect(() => {
    if (!isOpen) {
      setIsLogin(true)
    }
  }, [isOpen])

  const toggleForm = () => {
    setIsLogin(!isLogin)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        {isLogin ? (
          <LoginForm onSuccess={onClose} onToggleForm={toggleForm} />
        ) : (
          <SignupForm onSuccess={onClose} onToggleForm={toggleForm} />
        )}
      </DialogContent>
    </Dialog>
  )
}


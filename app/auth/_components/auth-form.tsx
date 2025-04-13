'use client'


import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useForm } from "react-hook-form"
import { signIn } from "next-auth/react"
import { toast } from '@/components/ui/use-toast'

export function AuthForm() {
    const form = useForm()

    const handleSubmit = form.handleSubmit(async (data) => {
        try {
          await signIn('nodemailer', { email: data.email, redirect: false })
    
          toast({
            title: 'Magic Link Sent',
            description: 'Check your email for the magic link to login',
          })
        } catch (error) {
          toast({
            title: 'Error',
            description: 'An error occurred. Please try again.',
          })
        }
      })

  return (
    <div className="mx-auto max-w-md px-4 py-12 sm:px-6 lg:px-8">
      <div className="space-y-4 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-primary">Log in</h1>
        <p className="text-muted-foreground">Entre com o seu Email para efetuar o log in.</p>
      </div>
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <Label htmlFor="email" className="sr-only rounded-md">
            Email address
          </Label>
          <Input
            {...form.register('email')}
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="Email address"
            className="block w-full appearance-none rounded-md border border-input bg-background px-3 py-2 placeholder-muted-foreground focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
          />
        </div>
        <Button type="submit" className="w-full text-white" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Enviando...' : 'Autenticar'}
        </Button>
      </form>
    </div>
  )
}
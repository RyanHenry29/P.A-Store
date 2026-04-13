import Link from 'next/link'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold text-foreground">Erro de Autenticação</h1>
        <p className="text-muted-foreground">
          Ocorreu um erro durante a autenticação. Por favor, tente novamente.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center rounded-lg bg-cyan-500 px-6 py-3 text-sm font-medium text-background hover:bg-cyan-400 transition-colors"
        >
          Voltar para Login
        </Link>
      </div>
    </div>
  )
}

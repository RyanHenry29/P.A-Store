"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import type { Categoria } from "@/lib/types"

interface CatalogoNavProps {
  categorias: Categoria[]
}

export function CatalogoNav({ categorias }: CatalogoNavProps) {
  const pathname = usePathname()

  return (
    <nav className="border-b border-border bg-background/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
          <Link
            href="/catalogo"
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              pathname === "/catalogo"
                ? "bg-[#00d4ff] text-black"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            Todos
          </Link>
          {categorias.map((categoria) => (
            <Link
              key={categoria.id}
              href={`/catalogo/categoria/${categoria.slug}`}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                pathname === `/catalogo/categoria/${categoria.slug}`
                  ? "bg-[#00d4ff] text-black"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {categoria.nome}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  )
}

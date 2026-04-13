import { MapPin, Clock, Instagram, Phone, FileText, RefreshCw } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Configuracoes } from "@/lib/configuracoes"

interface CatalogoFooterProps {
  config: Configuracoes
}

export function CatalogoFooter({ config }: CatalogoFooterProps) {
  const whatsappLink = config.whatsapp 
    ? `https://wa.me/55${config.whatsapp.replace(/\D/g, "")}` 
    : "#"
  
  const instagramLink = config.instagram 
    ? `https://www.instagram.com/${config.instagram.replace("@", "")}` 
    : "#"
  
  const mapsLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${config.endereco}, ${config.bairro}, ${config.cidade} - ${config.estado}, ${config.cep}`
  )}`

  return (
    <footer className="border-t border-border bg-card">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo e Descrição */}
          <div className="space-y-4">
            <Link href="/catalogo" className="flex items-center gap-3">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/641775678_17911416048341335_3153229132708064680_n-tQdMANy60QKphYxTzhlbOnKHmidzFY.jpg"
                alt={config.nome_loja}
                width={50}
                height={50}
                className="rounded-full"
              />
              <div>
                <span className="font-bold text-foreground text-lg">{config.nome_loja.toUpperCase()}</span>
                <p className="text-xs text-[#00d4ff]">{config.slogan}</p>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm">
              {config.sobre_loja || "As melhores roupas e acessorios. Estilo e qualidade para voce arrasar!"}
            </p>
            
            {/* Redes Sociais */}
            {config.instagram && (
              <div className="flex items-center gap-3">
                <a
                  href={instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 hover:opacity-90 text-white rounded-full text-sm font-medium transition-opacity"
                >
                  <Instagram className="w-4 h-4" />
                  @{config.instagram.replace("@", "")}
                </a>
              </div>
            )}
          </div>

          {/* Horário de Funcionamento */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#00d4ff]" />
              Horario de Funcionamento
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Segunda a Sexta</span>
                <span className="text-foreground font-medium">
                  {config.horario_seg_sex_abertura || "09:00"} - {config.horario_seg_sex_fechamento || "20:00"}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Sabado</span>
                <span className="text-foreground font-medium">
                  {config.horario_sab_abertura || "09:00"} - {config.horario_sab_fechamento || "20:00"}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Domingo</span>
                <span className="text-foreground font-medium">
                  {config.horario_dom_abertura || "09:00"} - {config.horario_dom_fechamento || "14:00"}
                </span>
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#00d4ff]" />
              Nossa Loja
            </h3>
            <address className="not-italic text-sm text-muted-foreground space-y-1">
              <p>{config.endereco}</p>
              <p>{config.bairro}</p>
              <p>{config.cidade} - {config.estado}, {config.cep}</p>
            </address>
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[#00d4ff] hover:underline text-sm"
            >
              <MapPin className="w-4 h-4" />
              Ver no mapa
            </a>
          </div>

          {/* Contato e Políticas */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Phone className="w-5 h-5 text-[#00d4ff]" />
              Contato
            </h3>
            <div className="space-y-3">
              {config.whatsapp && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-lg text-sm font-medium transition-colors"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              )}
              {config.instagram && (
                <a
                  href={instagramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border hover:border-[#00d4ff]/50 text-foreground rounded-lg text-sm font-medium transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                  Instagram
                </a>
              )}
            </div>

            {/* Políticas */}
            {config.politica_troca && (
              <div className="mt-4 pt-4 border-t border-border">
                <h4 className="font-medium text-foreground flex items-center gap-2 text-sm mb-2">
                  <RefreshCw className="w-4 h-4 text-[#00d4ff]" />
                  Trocas e Devoluções
                </h4>
                <p className="text-xs text-muted-foreground">
                  {config.politica_troca}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border py-4">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} {config.nome_loja} - {config.slogan}. Todos os direitos reservados.</p>
          <div className="flex items-center gap-4">
            <Link href="/catalogo" className="hover:text-foreground transition-colors">
              Catalogo
            </Link>
            <span>•</span>
            <Link href="/catalogo/carrinho" className="hover:text-foreground transition-colors">
              Carrinho
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

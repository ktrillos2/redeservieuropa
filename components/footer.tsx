import { Phone, Mail, MapPin, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <Image src="/images/logo.png" alt="REDESERVI PARIS" width={50} height={50} />
              <div>
                <h3 className="text-xl font-bold">REDESERVI</h3>
                <p className="text-yellow-400">PARIS</p>
              </div>
            </div>
            <p className="text-primary-foreground/80 mb-4 max-w-md text-pretty">
              Servicio premium de transporte privado en París. Conectamos aeropuertos, centro de París y Disneyland con
              comodidad y elegancia.
            </p>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              ))}
              <span className="ml-2 text-sm">+1000 clientes satisfechos</span>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4">Contacto</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-yellow-400" />
                <span>+33 1 23 45 67 89</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-yellow-400" />
                <span>info@redeservi.paris</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-yellow-400" />
                <span>París, Francia</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Servicios</h4>
            <div className="space-y-2 text-sm">
              <Link href="#" className="block hover:text-yellow-400 transition-colors">
                Aeropuerto CDG
              </Link>
              <Link href="#" className="block hover:text-yellow-400 transition-colors">
                Aeropuerto Orly
              </Link>
              <Link href="#" className="block hover:text-yellow-400 transition-colors">
                Aeropuerto Beauvais
              </Link>
              <Link href="#" className="block hover:text-yellow-400 transition-colors">
                París ↔ Disneyland
              </Link>
              <Link href="#" className="block hover:text-yellow-400 transition-colors">
                Tour Nocturno
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center text-sm text-primary-foreground/60">
          <p>© 2025 REDESERVI PARIS. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

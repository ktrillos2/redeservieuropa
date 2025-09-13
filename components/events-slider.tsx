"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

type EventItem = {
  id: string
  title: string
  image: string
  pricePerPerson: number
  date?: string
  time?: string
  meetingPoint?: string
}

export function EventsSlider({ className }: { className?: string }) {
  const router = useRouter()

  // Fuente de eventos (por ahora estática; fácilmente reemplazable por datos reales)
  const events = useMemo<EventItem[]>(
    () => [
      {
        id: "evento-tour-paris",
        title: "Tour París Nocturno",
        image: "/vehicles/stepway-paris-2.jpg",
        pricePerPerson: 200,
        date: "2025-10-15",
        time: "18:00",
        meetingPoint: "Disneyland Paris – Punto de encuentro",
      },
      {
        id: "evento-disney-shuttle",
        title: "Shuttle a Disneyland (Ida/Vuelta)",
        image: "/family-transport-to-disneyland-paris-castle.jpg",
        pricePerPerson: 60,
        date: "2025-10-20",
        time: "09:00",
        meetingPoint: "París Centro",
      },
      {
        id: "evento-charles-triatlon",
        title: "Traslado especial Maratón París",
        image: "/vehicles/stepway-paris-4.jpg",
        pricePerPerson: 45,
        date: "2025-11-02",
        time: "06:30",
        meetingPoint: "Aeropuerto CDG – Terminal 2",
      },
      {
        id: "evento-city-tour-diurno",
        title: "City Tour Diurno",
        image: "/vehicles/stepway-paris-1.jpg",
        pricePerPerson: 120,
        date: "2025-10-22",
        time: "14:00",
        meetingPoint: "Torre Eiffel – Trocadero",
      },
      {
        id: "evento-bruja-daytrip",
        title: "Excursión a Brujas (Día Completo)",
        image: "/vehicles/stepway-paris-6.jpg",
        pricePerPerson: 180,
        date: "2025-11-10",
        time: "07:30",
        meetingPoint: "París Centro",
      },
    ],
    []
  )

  const apiRef = useRef<CarouselApi | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const [isHover, setIsHover] = useState(false)

  // Autoplay sencillo con pausa al hacer hover
  useEffect(() => {
    const start = () => {
      if (intervalRef.current) return
      intervalRef.current = setInterval(() => {
        apiRef.current?.scrollNext()
      }, 4000)
    }
    const stop = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
    if (!isHover) start()
    return () => stop()
  }, [isHover])

  const handleClick = useCallback(
    (ev: EventItem) => {
      try {
        const d = ev.date || ""
        const t = ev.time || ""
        const isNightTime = (() => {
          const [hh] = (t || "").split(":").map(Number)
          const h = hh ?? 0
          return h >= 21 || h < 6
        })()

        const bookingData = {
          isEvent: true,
          eventId: ev.id,
          eventTitle: ev.title,
          tourId: ev.id,
          passengers: 1,
          date: d,
          time: t,
          pickupAddress: ev.meetingPoint || "",
          dropoffAddress: "",
          flightNumber: "",
          luggage23kg: 0,
          luggage10kg: 0,
          babyStrollers: 0,
          specialRequests: "",
          contactName: "",
          contactPhone: "",
          contactEmail: "",
          isNightTime,
          extraLuggage: false,
          pricePerPerson: ev.pricePerPerson,
          totalPrice: ev.pricePerPerson,
        }

        localStorage.setItem("bookingData", JSON.stringify(bookingData))
        router.push("/pago")
      } catch (e) {
        console.error("No se pudo preparar el pago del evento:", e)
      }
    },
    [router]
  )

  return (
    <div
      className={cn(
        "group relative w-full max-w-2xl",
        // tamaño pequeño
        "h-36 sm:h-40",
        className
      )}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <Carousel
        className="h-full rounded-xl shadow-lg ring-1 ring-white/10"
        opts={{ align: "start", loop: true }}
        setApi={(api) => {
          // Guardar instancia para autoplay
          // @ts-ignore embla type channel
          apiRef.current = api
        }}
      >
        <CarouselContent className="h-full">
          {events.map((ev) => (
            <CarouselItem key={ev.id} className="h-full">
              <button
                type="button"
                onClick={() => handleClick(ev)}
                className="relative block w-full h-full overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                aria-label={`Abrir pago de ${ev.title}`}
              >
                {/* Badge de Eventos */}
                <div className="absolute top-2 left-2 z-10">
                  <Badge className="bg-accent text-white shadow-sm">Eventos</Badge>
                </div>
                {/* Fondo imagen */}
                <div
                  className="absolute inset-0"
                  style={{
                    backgroundImage: `url('${ev.image}')`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                {/* Overlay para legibilidad */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                {/* Contenido inferior: título izquierda, precio derecha */}
                <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                  <div className="flex items-end justify-between gap-3">
                    <div className="text-left">
                      <div className="text-white text-sm sm:text-base font-semibold drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]">
                        {ev.title}
                      </div>
                    </div>
                    <div className="shrink-0">
                      <span className="inline-block rounded-md bg-white/90 px-2 py-1 text-xs sm:text-sm font-bold text-primary shadow-md">
                        {ev.pricePerPerson}€
                      </span>
                    </div>
                  </div>
                </div>

                {/* Borde/hover sutil */}
                <div className="absolute inset-0 ring-1 ring-white/10 group-hover:ring-white/20 transition" />
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}

export default EventsSlider

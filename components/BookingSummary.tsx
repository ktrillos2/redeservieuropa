import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Users } from "lucide-react";
import { AnimatedSection } from "@/components/animated-section";

export function BookingSummary({ bookingData, serviceLabel, fieldErrors, updateBookingField, paymentPickupAddress, paymentDropoffAddress, carritoState, deposit, total, remaining, payFullNow, amountNow, depositPercentInt, isQuick, isTour, isEvent, validateAndSetEmail }) {
  // ...extrae aquí la lógica y JSX del resumen de reserva...
  return (
    <AnimatedSection animation="slide-left" delay={200}>
      <Card className="transform hover:scale-105 transition-all duration-300 lg:sticky lg:top-40 lg:z-30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <CheckCircle className="w-6 h-6 text-accent" />
            Resumen de tu Reserva
            {bookingData.isEvent && (
              <Badge className="ml-2 bg-accent text-white">Evento</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* ...aquí va el contenido del resumen... */}
        </CardContent>
      </Card>
    </AnimatedSection>
  );
}

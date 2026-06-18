import { Metadata } from "next"
import Link from "next/link"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
    title: "Aviso Legal y Privacidad | REDESERVI PARIS",
    description: "Información legal, fiscal y de privacidad de REDESERVI PARIS.",
}

export default function AvisoLegalPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="container flex-grow mx-auto px-4 py-24 max-w-4xl pt-32">
                <h1 className="text-4xl font-bold mb-8 text-primary font-playfair">Aviso Legal y Privacidad</h1>

                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-gray-800 space-y-10">
                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-primary font-playfair border-b pb-2">1. Identificación de la Empresa</h2>
                        <div className="space-y-2">
                            <p><strong>Dénomination:</strong> REDESERVI PARIS</p>
                            <p><strong>Forme juridique:</strong> Société por actions simplifiée (SAS) (Société à associé unique)</p>
                            <p><strong>Capital social:</strong> 1 000,00 €</p>
                            <p><strong>Adresse du siège:</strong> 2, Chemin des Joncs Marins, 78630 Morainvilliers, FRANCE</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-primary font-playfair border-b pb-2">2. Registros y Numeración Identificativa</h2>
                        <div className="space-y-2">
                            <p><strong>SIRET:</strong> 990 128 159 00011</p>
                            <p><strong>Numéro d&apos;immatriculation au RCS:</strong> 990 128 159 R.C.S. Versailles</p>
                            <p><strong>Numéro de TVA intracommunautaire:</strong> FR 49990128159</p>
                            <p><strong>Numéro d&apos;identification Européen (EUID):</strong> FR7803.990128159</p>
                            <p><strong>Date d&apos;immatriculation:</strong> 12/08/2025</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-primary font-playfair border-b pb-2">3. Actividad Registrada</h2>
                        <div className="space-y-2">
                            <p><strong>Activité principale (INSEE):</strong> Transports de voyageurs par taxis (code : 4932Z)</p>
                            <p><strong>Description de l&apos;activité (RCS):</strong> Operador de turismo, diseño, organización, promoción, comercialización y venta de prestaciones turísticas, incluyendo notablemente: viajes, circuitos, estancias, excursiones, visitas guiadas, eventos turísticos, actividades culturales, deportivas o de ocio; reserva de servicios relacionados con el turismo (alojamiento, transporte, guías, restauración, preventa de entradas); asistencia, acogida y acompañamiento de turistas, individual o en grupo, locales o internacionales.</p>
                            <p><strong>Date de commencement d&apos;activité:</strong> 17/07/2025</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-primary font-playfair border-b pb-2">4. Representación Legal</h2>
                        <div className="space-y-2">
                            <p><strong>Presidente / Représentant légal:</strong> Frank Sneider Alvarez Torres</p>
                            <p>La presidencia y representación legal de la empresa están debidamente registradas ante el <em>Greffe du Tribunal des Activités Économiques de Versailles</em> según lo establecido en el Extrait Kbis y en el Registre des bénéficiaires effectifs.</p>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-2xl font-semibold text-primary font-playfair border-b pb-2">5. Obligaciones Fiscales</h2>
                        <div className="space-y-2">
                            <p>La entidad está sujeta a los siguientes regímenes impositivos registrados pertinentes a su Actividad:</p>
                            <ul className="list-disc pl-6 space-y-1">
                                <li><strong>Impôt sur les sociétés (IS):</strong> Réel simplifié d&apos;imposition</li>
                                <li><strong>Taxe sur la valeur ajoutée (TVA):</strong> Réel simplifié d&apos;imposition</li>
                                <li><strong>Cotisation foncière des empresas (CFE):</strong> Régime applicable</li>
                                <li><strong>Cotisation sur la valeur ajoutée des empresas (CVAE):</strong> Régime de la declaración</li>
                            </ul>
                            <p className="mt-2">Date de clôture de l&apos;exercice social : 31 décembre (1er ejercicio: 31/12/2025).</p>
                        </div>
                    </section>

                    <div className="pt-6 border-t font-medium text-center">
                        <Link href="/" className="text-primary hover:underline transition-all">
                            Volver a la página principal
                        </Link>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    )
}

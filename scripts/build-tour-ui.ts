import fs from 'fs'

const code = `
          {/* GALERÍA MOSAICO (ESTILO AIRBNB) */}
          <div className="relative rounded-2xl overflow-hidden mb-12">
            {galleryImages.length >= 3 ? (
              <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-2 h-[300px] md:h-[500px]">
                {/* Imagen Principal */}
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="md:col-span-2 md:row-span-2 relative group w-full h-full cursor-pointer overflow-hidden">
                      <img src={galleryImages[0]} alt="Imagen principal" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl p-0 bg-transparent border-none shadow-none" showCloseButton>
                    <div className="relative w-full h-[80vh] flex items-center justify-center">
                      <img src={galleryImages[0]} alt="Imagen ampliada" className="max-w-full max-h-full object-contain" />
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Imágenes Secundarias (solo en desktop) */}
                {galleryImages.slice(1, 5).map((src, idx) => (
                  <Dialog key={idx}>
                    <DialogTrigger asChild>
                      <button className="hidden md:block relative group w-full h-full cursor-pointer overflow-hidden">
                        <img src={src} alt={\`Imagen secundaria \${idx + 1}\`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl p-0 bg-transparent border-none shadow-none" showCloseButton>
                      <div className="relative w-full h-[80vh] flex items-center justify-center">
                        <img src={src} alt="Imagen ampliada" className="max-w-full max-h-full object-contain" />
                      </div>
                    </DialogContent>
                  </Dialog>
                ))}

                {/* Botón Ver todas las fotos */}
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="absolute bottom-4 right-4 md:bottom-6 md:right-6 bg-white/95 backdrop-blur-md text-primary px-4 py-2 rounded-lg text-sm font-semibold shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      Ver todas las fotos
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl p-0 bg-transparent border-none shadow-none" showCloseButton>
                    <Carousel className="w-full h-[80vh] flex items-center">
                      <CarouselContent>
                        {galleryImages.map((src, idx) => (
                          <CarouselItem key={idx}>
                            <div className="relative w-full h-[80vh] flex items-center justify-center">
                              <img src={src} alt={\`Galería \${idx + 1}\`} className="max-w-full max-h-full object-contain" />
                            </div>
                          </CarouselItem>
                        ))}
                      </CarouselContent>
                      <CarouselPrevious className="left-4 bg-white/20 hover:bg-white/40 text-white border-none" />
                      <CarouselNext className="right-4 bg-white/20 hover:bg-white/40 text-white border-none" />
                    </Carousel>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              // Fallback si hay pocas imágenes: solo la principal grande
              <div className="relative w-full h-[300px] md:h-[500px]">
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="relative group w-full h-full cursor-pointer overflow-hidden">
                      <img src={galleryImages[0] || "/placeholder.jpg"} alt="Principal" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl p-0 bg-transparent border-none shadow-none" showCloseButton>
                    <div className="relative w-full h-[80vh] flex items-center justify-center">
                      <img src={galleryImages[0]} alt="Imagen ampliada" className="max-w-full max-h-full object-contain" />
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {tourFromCms.isPopular && (
              <div className="absolute top-4 left-4 z-10">
                <Badge className="bg-white/95 backdrop-blur-md text-accent px-3 py-1 text-sm font-semibold shadow-md border-none">
                  <Star className="w-4 h-4 mr-1.5 fill-accent" />
                  {staticTexts.popular}
                </Badge>
              </div>
            )}
          </div>

          {/* CONTENIDO PRINCIPAL Y BARRA LATERAL */}
          <div className="grid md:grid-cols-3 gap-10 md:gap-16">
            
            {/* Columna Izquierda: Información del Tour (65%) */}
            <div className="md:col-span-2 space-y-12">
              
              {/* Header Info */}
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-primary font-display tracking-tight text-balance mb-4">
                  {tourFromCms.title}
                </h1>
                
                <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-muted-foreground mt-4">
                  {tourFromCms.route?.origin && tourFromCms.route?.destination && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-accent" />
                      <span className="font-medium">{tourFromCms.route.origin} ↔ {tourFromCms.route.destination}</span>
                    </div>
                  )}
                  {tourFromCms.route?.circuitName && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-accent" />
                      <span className="font-medium">{tourFromCms.route.circuitName}</span>
                    </div>
                  )}
                </div>
              </div>

              <Separator className="bg-border/50" />

              {/* Descripción */}
              <div>
                {Array.isArray(tourFromCms.description) ? (
                  <div className="prose prose-lg max-w-none text-muted-foreground prose-p:leading-relaxed prose-a:text-accent hover:prose-a:text-accent/80">
                    <PortableText value={tourFromCms.description as any} />
                  </div>
                ) : tourFromCms.summary ? (
                  <p className="text-xl text-muted-foreground leading-relaxed text-pretty">
                    {tourFromCms.summary}
                  </p>
                ) : null}
              </div>

              {/* Características e Incluye */}
              <div className="grid sm:grid-cols-2 gap-8">
                {Array.isArray(tourFromCms.features) && tourFromCms.features.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-semibold mb-6 text-primary flex items-center gap-2">
                      <Star className="w-6 h-6 text-accent" />
                      {staticTexts.features}
                    </h3>
                    <ul className="space-y-4">
                      {tourFromCms.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-3 text-muted-foreground">
                          <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <span className="leading-snug">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(tourFromCms.includes) && tourFromCms.includes.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-semibold mb-6 text-primary flex items-center gap-2">
                      <Shield className="w-6 h-6 text-accent" />
                      {staticTexts.includes}
                    </h3>
                    <ul className="space-y-4">
                      {tourFromCms.includes.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-muted-foreground">
                          <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Qué visitamos */}
              {Array.isArray(tourFromCms.visitedPlaces) && tourFromCms.visitedPlaces.length > 0 && (
                <div>
                  <Separator className="bg-border/50 mb-10" />
                  <h3 className="text-2xl font-semibold mb-6 text-primary flex items-center gap-2">
                    <Navigation className="w-6 h-6 text-accent" />
                    {staticTexts.visitedPlaces}
                  </h3>
                  <div className="relative border-l-2 border-accent/20 ml-3 space-y-6">
                    {tourFromCms.visitedPlaces.map((p, i) => (
                      <div key={i} className="relative pl-6">
                        <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-background border-2 border-accent" />
                        <p className="text-lg text-muted-foreground">{p}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notas y Overcapacity */}
              {((Array.isArray(tourFromCms.notes) && tourFromCms.notes.length > 0) || tourFromCms.overCapacityNote) && (
                <div className="bg-muted/30 p-6 md:p-8 rounded-2xl border border-border/50">
                  <h3 className="text-xl font-semibold mb-4 text-primary flex items-center gap-2">
                    <Info className="w-5 h-5 text-accent" />
                    {staticTexts.notes}
                  </h3>
                  
                  {Array.isArray(tourFromCms.notes) && tourFromCms.notes.length > 0 && (
                    <ul className="list-disc pl-5 space-y-2 mb-4">
                      {tourFromCms.notes.map((n, i) => (
                        <li key={i} className="text-muted-foreground">{n}</li>
                      ))}
                    </ul>
                  )}
                  
                  {tourFromCms.overCapacityNote && (
                    <p className="text-sm text-muted-foreground italic border-t border-border/50 pt-4 mt-4">
                      {tourFromCms.overCapacityNote}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Columna Derecha: Sticky Sidebar (35%) */}
            <div className="md:col-span-1 relative">
              <div className="sticky top-28 space-y-6">
                
                {/* Tarjeta de Resumen y Precio (Solo visual, reserva está en footer fix) */}
                <Card className="shadow-xl shadow-black/5 border-border/50 overflow-hidden rounded-2xl">
                  <div className="p-6 md:p-8 bg-gradient-to-b from-card to-muted/10">
                    {tourFromCms.startingPriceLabel && (
                      <div className="mb-6">
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                          {staticTexts.priceFrom || "Desde"}
                        </span>
                        <div className="text-4xl font-black text-primary">
                          {tourFromCms.startingPriceEUR ? \`€\${tourFromCms.startingPriceEUR}\` : ""}
                        </div>
                      </div>
                    )}
                    
                    <div className="space-y-4 mb-8 text-sm">
                      <div className="flex justify-between items-center py-3 border-b border-border/50">
                        <span className="text-muted-foreground font-medium">Modalidad</span>
                        <span className="font-semibold text-primary">Tour Privado</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-border/50">
                        <span className="text-muted-foreground font-medium">Cancelación</span>
                        <span className="font-semibold text-green-600">Gratuita</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Comodidades del Vehículo */}
                <Card className="shadow-lg shadow-black/5 border-border/50 rounded-2xl overflow-hidden">
                  <div className="p-6 md:p-8">
                    <h3 className="text-lg font-bold text-primary mb-6">
                      {staticTexts.vehicleAmenities}
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex flex-col items-center gap-3 p-4 bg-primary/5 rounded-xl transition-colors hover:bg-primary/10">
                        <Wifi className="w-6 h-6 text-accent" />
                        <span className="text-sm font-medium text-primary text-center">{staticTexts.wifi}</span>
                      </div>
                      <div className="flex flex-col items-center gap-3 p-4 bg-primary/5 rounded-xl transition-colors hover:bg-primary/10">
                        <Coffee className="w-6 h-6 text-accent" />
                        <span className="text-sm font-medium text-primary text-center">{staticTexts.water}</span>
                      </div>
                      <div className="flex flex-col items-center gap-3 p-4 bg-primary/5 rounded-xl transition-colors hover:bg-primary/10">
                        <Car className="w-6 h-6 text-accent" />
                        <span className="text-sm font-medium text-primary text-center">{staticTexts.comfortable}</span>
                      </div>
                      <div className="flex flex-col items-center gap-3 p-4 bg-primary/5 rounded-xl transition-colors hover:bg-primary/10">
                        <Shield className="w-6 h-6 text-accent" />
                        <span className="text-sm font-medium text-primary text-center">{staticTexts.safe}</span>
                      </div>
                    </div>
                  </div>
                </Card>

              </div>
            </div>

          </div>
`
console.log('Done')

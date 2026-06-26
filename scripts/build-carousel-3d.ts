import fs from 'fs'

const code = `
          {/* GALERÍA 3D CARRUSEL CON CARDS */}
          <div className="relative w-full mb-16 pt-4 pb-12 overflow-hidden">
            <Carousel 
              opts={{ 
                align: "center",
                loop: true,
              }} 
              className="w-full"
            >
              <CarouselContent className="-ml-4 md:-ml-8 py-10 px-4">
                {galleryImages.map((src, idx) => (
                  <CarouselItem key={idx} className="pl-4 md:pl-8 basis-[85%] md:basis-[60%] lg:basis-[50%]">
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="relative w-full h-[300px] md:h-[450px] cursor-pointer group outline-none">
                          <div className="absolute inset-0 rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] transform transition-transform duration-500 group-hover:scale-[1.03] group-hover:-translate-y-3 border-[6px] border-white overflow-hidden bg-muted">
                            <img src={src} alt={\`Imagen \${idx + 1}\`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-500" />
                          </div>
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-5xl p-0 bg-transparent border-none shadow-none" showCloseButton>
                        <div className="relative w-full h-[80vh] flex items-center justify-center">
                          <img src={src} alt="Imagen ampliada" className="max-w-full max-h-full object-contain" />
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="hidden md:block">
                <CarouselPrevious className="left-8 xl:left-16 w-14 h-14 bg-white/90 text-primary hover:bg-white hover:scale-110 transition-all border-none shadow-xl z-20" />
                <CarouselNext className="right-8 xl:right-16 w-14 h-14 bg-white/90 text-primary hover:bg-white hover:scale-110 transition-all border-none shadow-xl z-20" />
              </div>
            </Carousel>
            
            {/* Popular Badge */}
            {tourFromCms.isPopular && (
              <div className="absolute top-8 left-4 md:left-12 z-50">
                <Badge className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground px-4 py-1.5 text-sm font-bold shadow-lg shadow-accent/20 border-none rounded-full flex items-center gap-1.5 transform -rotate-2">
                  <Star className="w-4 h-4 fill-current" />
                  {staticTexts.popular}
                </Badge>
              </div>
            )}
          </div>
`
console.log("Done")

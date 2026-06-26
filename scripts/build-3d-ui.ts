import fs from 'fs'

const code = `
          {/* GALERÍA 3D COVERFLOW CON CARDS */}
          <div className="relative w-full mb-16 pt-4 pb-12">
            <div className="flex justify-center items-center w-full h-[250px] sm:h-[350px] md:h-[500px] [perspective:1200px] group/gallery">
              {galleryImages.length >= 3 ? (
                <>
                  {/* Left Image (idx 1) */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button aria-label="Ver imagen secundaria" className="relative w-1/3 h-[70%] md:h-[80%] -mr-[15%] md:-mr-[10%] z-10 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 [transform:rotateY(25deg)_scale(0.85)] hover:[transform:rotateY(0deg)_scale(1.05)] hover:z-40 opacity-70 hover:opacity-100 border-2 border-white/50 bg-muted">
                        <img src={galleryImages[1]} alt="Imagen secundaria" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl p-0 bg-transparent border-none shadow-none" showCloseButton>
                      <div className="relative w-full h-[80vh] flex items-center justify-center">
                        <img src={galleryImages[1]} alt="Imagen ampliada" className="max-w-full max-h-full object-contain" />
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  {/* Center Image (idx 0) */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button aria-label="Ver imagen principal" className="relative w-[55%] md:w-[45%] h-[95%] md:h-full z-30 rounded-2xl md:rounded-3xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] overflow-hidden cursor-pointer transition-all duration-500 hover:scale-105 border-4 border-white/20 bg-muted">
                        <img src={galleryImages[0]} alt="Imagen principal" className="w-full h-full object-cover" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl p-0 bg-transparent border-none shadow-none" showCloseButton>
                      <div className="relative w-full h-[80vh] flex items-center justify-center">
                        <img src={galleryImages[0]} alt="Imagen ampliada" className="max-w-full max-h-full object-contain" />
                      </div>
                    </DialogContent>
                  </Dialog>
                  
                  {/* Right Image (idx 2) */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <button aria-label="Ver imagen secundaria" className="relative w-1/3 h-[70%] md:h-[80%] -ml-[15%] md:-ml-[10%] z-10 rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden cursor-pointer transition-all duration-500 [transform:rotateY(-25deg)_scale(0.85)] hover:[transform:rotateY(0deg)_scale(1.05)] hover:z-40 opacity-70 hover:opacity-100 border-2 border-white/50 bg-muted">
                        <img src={galleryImages[2]} alt="Imagen secundaria" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl p-0 bg-transparent border-none shadow-none" showCloseButton>
                      <div className="relative w-full h-[80vh] flex items-center justify-center">
                        <img src={galleryImages[2]} alt="Imagen ampliada" className="max-w-full max-h-full object-contain" />
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <button aria-label="Ver imagen principal" className="relative w-[85%] md:w-[65%] h-full z-20 rounded-3xl shadow-[0_30px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:[transform:rotateX(2deg)_rotateY(-2deg)] border-4 border-white/20 bg-muted">
                      <img src={galleryImages[0] || "/placeholder.jpg"} alt="Principal" className="w-full h-full object-cover" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-5xl p-0 bg-transparent border-none shadow-none" showCloseButton>
                    <div className="relative w-full h-[80vh] flex items-center justify-center">
                      <img src={galleryImages[0]} alt="Imagen ampliada" className="max-w-full max-h-full object-contain" />
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>

            {/* Popular Badge */}
            {tourFromCms.isPopular && (
              <div className="absolute top-0 left-4 md:left-8 z-50">
                <Badge className="bg-gradient-to-r from-accent to-accent/80 text-accent-foreground px-4 py-1.5 text-sm font-bold shadow-lg shadow-accent/20 border-none rounded-full flex items-center gap-1.5 transform -rotate-2">
                  <Star className="w-4 h-4 fill-current" />
                  {staticTexts.popular}
                </Badge>
              </div>
            )}

            {/* View All Button */}
            {galleryImages.length > 3 && (
              <div className="absolute -bottom-4 right-4 md:right-10 z-50">
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="bg-white text-primary px-5 py-2.5 rounded-full text-sm font-bold shadow-[0_10px_20px_rgba(0,0,0,0.15)] hover:shadow-[0_15px_30px_rgba(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 flex items-center gap-2.5 border border-border/30">
                      <ImageIcon className="w-4 h-4 text-accent" />
                      {staticTexts.enlargeImage}
                      <span className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full ml-1">
                        {galleryImages.length}
                      </span>
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
            )}
          </div>
`
console.log('Done')

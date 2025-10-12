'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { X } from 'lucide-react';

const galleryImages = [
  { id: 1, title: 'Main Campus Building', category: 'Campus', color: 'from-blue-500 to-blue-600' },
  { id: 2, title: 'Modern Library', category: 'Facilities', color: 'from-indigo-500 to-indigo-600' },
  { id: 3, title: 'Science Laboratory', category: 'Labs', color: 'from-teal-500 to-teal-600' },
  { id: 4, title: 'Student Center', category: 'Campus Life', color: 'from-purple-500 to-purple-600' },
  { id: 5, title: 'Sports Complex', category: 'Sports', color: 'from-blue-600 to-indigo-600' },
  { id: 6, title: 'Innovation Hub', category: 'Technology', color: 'from-indigo-600 to-purple-600' },
  { id: 7, title: 'Auditorium', category: 'Facilities', color: 'from-blue-500 to-teal-500' },
  { id: 8, title: 'Campus Garden', category: 'Campus', color: 'from-teal-500 to-green-500' },
  { id: 9, title: 'Computer Lab', category: 'Labs', color: 'from-purple-500 to-indigo-500' },
];

export function CampusGallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  return (
    <section className="py-24 px-4 relative bg-gradient-to-br from-gray-50 via-blue-50/20 to-indigo-50/30 overflow-hidden">
      {/* Animated Background Blobs */}
      <motion.div
        className="absolute top-1/3 right-1/6 w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 bg-gradient-to-r from-blue-400/15 via-indigo-400/10 to-purple-400/15 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          x: [0, -30, 0],
          y: [0, 20, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <div className="container mx-auto relative z-10">
        <motion.div
          className="text-center mb-12 md:mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-200 rounded-full text-blue-700 font-medium text-sm mb-6 shadow-lg"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            📸 Visual Tour
          </motion.div>
          
          <motion.h2
            className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-gray-900 px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Campus Life <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Gallery</span>
          </motion.h2>
          <motion.p
            className="text-lg text-gray-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Explore our vibrant campus and state-of-the-art facilities
          </motion.p>
        </motion.div>

        {/* Masonry Grid */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 sm:gap-6 space-y-4 sm:space-y-6">
          {galleryImages.map((image, index) => (
            <motion.div
              key={image.id}
              className="break-inside-avoid group cursor-pointer"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onClick={() => setSelectedImage(image.id)}
            >
              <motion.div
                className="relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
                whileHover={{ scale: 1.03, y: -5 }}
                transition={{ duration: 0.3 }}
              >
                {/* Image Placeholder with Gradient */}
                <div className={`aspect-[${index % 3 === 0 ? '4/5' : index % 3 === 1 ? '1/1' : '16/9'}] bg-gradient-to-br ${image.color} flex items-center justify-center`}>
                  <div className="text-6xl">
                    {image.category === 'Campus' && '🏛️'}
                    {image.category === 'Facilities' && '🏢'}
                    {image.category === 'Labs' && '🔬'}
                    {image.category === 'Campus Life' && '🎓'}
                    {image.category === 'Sports' && '⚽'}
                    {image.category === 'Technology' && '💻'}
                  </div>
                </div>

                {/* Overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{image.title}</h3>
                    <span className="inline-block px-2 sm:px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs sm:text-sm text-white">
                      {image.category}
                    </span>
                  </div>
                </motion.div>

                {/* Zoom Icon */}
                <motion.div
                  className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  whileHover={{ scale: 1.1 }}
                >
                  <span className="text-gray-700 text-xl">🔍</span>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Modal */}
        {selectedImage && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              className="relative max-w-5xl w-full"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                className="absolute -top-12 right-0 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                onClick={() => setSelectedImage(null)}
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {/* Image */}
              <div className={`aspect-video rounded-2xl bg-gradient-to-br ${galleryImages.find(img => img.id === selectedImage)?.color} flex items-center justify-center`}>
                <div className="text-9xl">
                  {galleryImages.find(img => img.id === selectedImage)?.category === 'Campus' && '🏛️'}
                  {galleryImages.find(img => img.id === selectedImage)?.category === 'Facilities' && '🏢'}
                  {galleryImages.find(img => img.id === selectedImage)?.category === 'Labs' && '🔬'}
                  {galleryImages.find(img => img.id === selectedImage)?.category === 'Campus Life' && '🎓'}
                  {galleryImages.find(img => img.id === selectedImage)?.category === 'Sports' && '⚽'}
                  {galleryImages.find(img => img.id === selectedImage)?.category === 'Technology' && '💻'}
                </div>
              </div>

              {/* Caption */}
              <div className="mt-4 sm:mt-6 text-center px-4">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2">
                  {galleryImages.find(img => img.id === selectedImage)?.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-400">
                  {galleryImages.find(img => img.id === selectedImage)?.category}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  );
}

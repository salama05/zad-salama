import React from 'react';
import { Link } from 'react-router-dom';
import * as Icons from 'react-icons/fa';
import { videos } from '../data/videos';

function Videos() {
  return (
    <div className='page-enter-active pb-20'>
      <div className='flex items-center mb-8 relative border-b-2 border-zad-border/20 pb-4'>
        <Link to="/home" className='absolute right-0 text-zad-border hover:text-[#C5A028] transition-colors p-2 z-10 cursor-pointer'>
           <Icons.FaArrowRight size={24} />
        </Link>
        <div className='text-center w-full'>
          <h2 className='text-3xl font-amiri font-bold text-zad-border drop-shadow-sm'>مرئيات</h2>
          <p className='text-sm font-cairo opacity-60 mt-2'>مواعظ ومقاطع مختارة</p>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        {videos.map((item) => (
          <div key={item.id} className='bg-white/60 border border-zad-border/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow'>
            <div className='relative w-full pt-[56.25%] bg-black/5'>
              {item.type === 'youtube' ? (
                <iframe
                  className='absolute top-0 left-0 w-full h-full'
                  src={`https://www.youtube.com/embed/${item.videoId}?controls=0&modestbranding=1&rel=0&disablekb=1&iv_load_policy=3&showinfo=0&fs=0`}
                  title={item.title}
                  frameBorder="0"
                  sandbox="allow-scripts allow-same-origin allow-presentation"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              ) : (
                <video
                  className='absolute top-0 left-0 w-full h-full object-cover bg-black'
                  controls
                  src={item.videoUrl}
                ></video>
              )}
            </div>
            <div className='p-5 text-right'>
              <h3 className='font-amiri font-bold text-xl text-zad-text mb-3 leading-relaxed'>{item.title}</h3>
              <div className='flex items-center justify-start text-sm font-cairo text-zad-text/70'>
                <div className='flex items-center gap-2'>
                  <Icons.FaUserTie size={12} className='text-zad-border' />
                  <span>{item.speaker}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Videos;

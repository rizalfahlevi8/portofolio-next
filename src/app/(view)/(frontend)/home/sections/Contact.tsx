import ArrowUpRightIcon from '@/assets/icons/arrow-up-right.svg';
import grainImage from '@/assets/images/grain.jpg';
import Link from 'next/link';

export const ContactSection = () => {
  return (
    <div className='mx-10 md:mx-15 lg:mx-105 py-16 pt-12 lg:py-24 lg:pt-20'>
      <div className='container'>
        <div className='bg-gradient-white text-black py-8 px-10 rounded-3xl text-center md:text-left relative overflow-hidden z-0 border-1 border-gray-950'>
          <div className='absolute inset-0 opacity-5 -z-10' style={{
            backgroundImage: `url(${grainImage.src})`,
          }}></div>
          <div className='flex flex-col md:flex-row gap-8 md:gap-16 items-center'>
            <div>
              <h2 className='font-serif text-2xl md:text-3xl'>Let&apos;t create something amazing together</h2>
              <p className='text-sm md:text-base mt-2'>Ready to bring your next project to life? Let&apos;s connect and discuss how I can help your achieve goals</p>
            </div>
            <div >
              <Link
                href="/projects"
                className="group relative bg-white border-2 border-gray-950 text-gray-950 h-12 px-8 rounded-xl font-semibold inline-flex items-center justify-center gap-2 hover:bg-gray-950 hover:text-white transition-all duration-300 cursor-pointer overflow-hidden"
              >
                {/* Button background animation */}
                <div className="absolute inset-0 bg-gray-950 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out" />

                <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
                  Contact
                </span>
                <ArrowUpRightIcon className="relative z-10 w-4 h-4 transition-all duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
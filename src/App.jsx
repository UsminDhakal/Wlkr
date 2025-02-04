import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import React, { useEffect, useRef, useState } from 'react';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [vals, setVals] = useState({
    currentIndex: 1,
    maxIndex: 422,
  });

  const imagesLoaded = useRef(0);
  const imageArray = useRef([]);
  const gsapVals = useRef({ currentIndex: 1 });
  const canvasRef = useRef(null);
  const parentDiv = useRef(null);

  useEffect(() => {
    preloadImages();
  }, []); 

  const preloadImages = () => {
    for (let i = 1; i <= vals.maxIndex; i++) {
      const imageUrl = `./images/frame_${i.toString().padStart(4, '0')}.jpg`;
      const image = new Image();
      image.src = imageUrl;

      image.onload = () => {
        imagesLoaded.current++;
        if (imagesLoaded.current === vals.maxIndex) {
          console.log('all images loaded');
          loadImage(vals.currentIndex); 
        }
      };

      image.onerror = () => {
        console.error(`Failed to load image: ${imageUrl}`);
      };

      imageArray.current.push(image);
    }
  };

  const loadImage = (index) => {
    if (index >= 1 && index <= vals.maxIndex) {
      const img = imageArray.current[index - 1]; 
      const canvas = canvasRef.current;
      if (canvas && img) {
        const draw = canvas.getContext('2d');
        if (draw) {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;

          const scaleX = canvas.width / img.width;
          const scaleY = canvas.height / img.height;
          const scale = Math.max(scaleX, scaleY);

          const newWidth = img.width * scale;
          const newHeight = img.height * scale;

          const offsetX = (canvas.width - newWidth) / 2;
          const offsetY = (canvas.height - newHeight) / 2;

          draw.clearRect(0, 0, canvas.width, canvas.height);
          draw.imageSmoothingEnabled = true;
          draw.imageSmoothingQuality = 'high';
          draw.drawImage(img, offsetX, offsetY, newWidth, newHeight);

          setVals((prevVals) => ({
            ...prevVals,
            currentIndex: index,
          }));
        }
      }
    }
  };

  useGSAP(() => {
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: parentDiv.current,
        start: 'top top',
        scrub: 2,
        // markers: true,
        end: 'bottom bottom',
      },
    });

    tl.to(gsapVals.current, {
      currentIndex: vals.maxIndex,
      onUpdate: () => {
        const frame = Math.floor(gsapVals.current.currentIndex); 
        loadImage(frame);
      },
    });
  });

  return (
    <div className='w-full bg-zinc-900'>
      <div ref={parentDiv} className='w-full h-[600vh]'>
        <div className='w-full h-screen sticky left-0 top-0'>
          <canvas ref={canvasRef} className='w-full h-screen'></canvas>
        </div>
      </div>
    </div>
  );
}

export default App;

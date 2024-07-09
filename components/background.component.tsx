import Image from 'next/image';

const Background = () => {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          filter: 'blur(8px)',
          zIndex: -1,
        }}
      >
        <Image
          src="/img/gymLuces.jpeg"
          layout="fill"
          objectFit="cover"
          alt="Background Image"
          priority
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        />
      </div>
    </div>
  );
};

export default Background;

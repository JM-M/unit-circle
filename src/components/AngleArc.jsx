const VIEWPORT_SIZE = 100;
const ARC_SIZE = VIEWPORT_SIZE / 2;
const RADIUS = ARC_SIZE / 2;

const AngleArc = ({ cos, sin }) => {
  const x0 = cos * RADIUS + ARC_SIZE;
  const y0 = ARC_SIZE - sin * RADIUS;

  const sinSign = Math.sign(sin);

  let largeArcflag = 0;
  let xAxisRotation = 0;
  if (sinSign === -1) {
    largeArcflag = 1;
    xAxisRotation = 1;
  }

  return (
    <svg
      width='100'
      height='100'
      xmlns='http://www.w3.org/2000/svg'
      className='angle-indicator'
    >
      <path
        d={`M ${x0},${y0} A 25,25, ${xAxisRotation}, ${largeArcflag},1, 75,${ARC_SIZE}`}
        fill='none'
        stroke='#0277BD'
        strokeWidth='2'
      />
    </svg>
  );
};

export default AngleArc;

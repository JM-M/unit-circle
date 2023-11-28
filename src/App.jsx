import { useState, useRef, useEffect } from 'react';
import AngleArc from './components/AngleArc';
import approximate from './utils/approximate';
import clamp from './utils/clamp';
import './App.css';

const DP = 4;
const CIRCLE_SIZE = 400;
const CIRCLE_RADIUS = CIRCLE_SIZE / 2;

function App() {
  const [circleCoordinates, setCircleCoordinates] = useState({ x: 0, y: 0 });

  const [x, setX] = useState(0.75 * CIRCLE_SIZE);
  const [y, setY] = useState(0.75 * CIRCLE_SIZE);
  const [cos, setCos] = useState(0.5);
  const [sin, setSin] = useState(0.5);
  const [isMovingCos, setIsMovingCos] = useState(false);
  const [isMovingSin, setIsMovingSin] = useState(false);
  const [angle, setAngle] = useState(Math.PI / 4); // in radians
  const [isMovingAngle, setIsMovingAngle] = useState(false);

  const circleRef = useRef();

  const updateCos = (x) => {
    if (x < 0 || x > CIRCLE_SIZE) return;
    let cos = x / CIRCLE_RADIUS - 1;
    cos = approximate(cos, DP);
    setCos(cos);
    const angle = approximate(Math.acos(cos), DP);
    setAngle(angle);
  };

  const updateSin = (y) => {
    if (y < 0 || y > CIRCLE_SIZE) return;
    let sin = y / CIRCLE_RADIUS - 1;
    sin = approximate(sin, DP);
    setSin(sin);
    let angle = approximate(Math.asin(sin), DP);
    if (angle < 0) angle = 2 * Math.PI + angle;
    setAngle(angle);
  };

  const updateAngle = ({ x, y }) => {
    const opposite = y - CIRCLE_RADIUS;
    const adjacent = x - CIRCLE_RADIUS;
    const tan = opposite / adjacent;
    const oppositeSign = Math.sign(opposite);
    const adjacentSign = Math.sign(adjacent);
    // 1st quadrant
    let angle = approximate(Math.atan(tan), DP);
    if (adjacentSign === -1) {
      // 2nd & 3rd quadrants
      angle = approximate(Math.PI + angle, DP);
    } else if (adjacentSign > oppositeSign) {
      // 4th quadrant
      angle = approximate(2 * Math.PI + angle, DP);
    }
    setAngle(angle);
  };

  const handleMouseMove = (event) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    const circleBoundary = { min: 0, max: CIRCLE_SIZE };
    const x = clamp(mouseX - circleCoordinates.x, circleBoundary);
    const y = clamp(CIRCLE_SIZE - mouseY + circleCoordinates.y, circleBoundary);

    if (isMovingCos) {
      setX(x);
      updateCos(x);
    }
    if (isMovingSin) {
      setY(y);
      updateSin(y);
    }
    if (isMovingAngle) {
      updateAngle({ x, y });
    }
  };

  const stopUpdates = () => {
    setIsMovingAngle(false);
    setIsMovingCos(false);
    setIsMovingSin(false);
  };

  useEffect(() => {
    if (!circleRef.current) return;
    const getCircleCoordinates = () => {
      const circle = circleRef.current;
      if (!circle) return;
      const rect = circle.getBoundingClientRect();
      const scrollLeft = document.documentElement.scrollLeft;
      const scrollTop = document.documentElement.scrollTop;

      const x = rect.left + scrollLeft;
      const y = rect.top + scrollTop;

      return { x, y };
    };

    const handleWindowResize = () => {
      const circleCoordinates = getCircleCoordinates();
      setCircleCoordinates(circleCoordinates);
    };
    handleWindowResize();
    window.addEventListener('resize', handleWindowResize, true);
    return () => window.removeEventListener('resize', handleWindowResize, true);
  }, []);

  useEffect(() => {
    const trigValueToCoordinate = (n) => CIRCLE_RADIUS * (n + 1);

    const calculatedSin = approximate(Math.sin(angle), DP);
    if (Math.abs(calculatedSin) !== Math.abs(sin)) {
      setSin(calculatedSin);
      const y = approximate(trigValueToCoordinate(calculatedSin), DP);
      setY(y);
    }
    const calculatedCos = approximate(Math.cos(angle), DP);
    if (Math.abs(calculatedCos) !== Math.abs(cos)) {
      const x = approximate(trigValueToCoordinate(calculatedCos), DP);
      setCos(calculatedCos);
      setX(x);
    }
  }, [angle, sin, cos]);

  return (
    <div
      className='container'
      onMouseMove={handleMouseMove}
      onMouseUp={stopUpdates}
      onMouseLeave={stopUpdates}
    >
      <div
        ref={circleRef}
        className='circle'
        style={{ width: `${CIRCLE_SIZE}px`, height: `${CIRCLE_SIZE}px` }}
        onMouseUp={() => {
          setIsMovingAngle(false);
          setIsMovingCos(false);
          setIsMovingSin(false);
        }}
      >
        <span
          className='angle-line'
          style={{
            transform: `translateY(-50%) rotateZ(-${angle}rad)`,
            borderWidth: isMovingAngle ? 0 : 'unset',
            backgroundColor: isMovingAngle ? '#737300' : '#555',
          }}
          onMouseDown={() => setIsMovingAngle(true)}
        ></span>
        <span className='angle'>{angle} rad</span>
        <AngleArc cos={cos} sin={sin} />
        <span
          className='cos-label'
          style={{
            left: `${x}px`,
            top: sin > 0 ? '50%' : 'unset',
            bottom: sin < 0 ? '50%' : 'unset',
          }}
          onMouseDown={() => setIsMovingCos(true)}
        >
          <span className='label-text'>cos:</span> {cos}
        </span>
        <span
          className='cos-line'
          style={{
            left: `${x}px`,
            top: sin < 0 ? '50%' : 'unset',
            bottom: sin > 0 ? '50%' : 'unset',
            height: `${Math.abs(sin) * CIRCLE_RADIUS}px`,
          }}
        ></span>
        <span
          className='sin-label'
          style={{
            bottom: `${y}px`,
            left: cos < 0 ? '50%' : 'unset',
            right: cos > 0 ? '50%' : 'unset',
          }}
          onMouseDown={() => setIsMovingSin(true)}
        >
          <span className='label-text'>sin:</span>
          {sin}
        </span>
        <span
          className='sin-line'
          style={{
            bottom: `${y}px`,
            left: cos > 0 ? '50%' : 'unset',
            right: cos < 0 ? '50%' : 'unset',
            width: `${Math.abs(cos) * CIRCLE_RADIUS}px`,
          }}
        ></span>
      </div>
    </div>
  );
}

export default App;

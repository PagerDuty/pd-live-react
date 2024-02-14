import React from 'react';

const Beacon = ({
  color, loading, size = '1.2em',
}) => {
  const containerStyle = {
    width: size,
    height: size,
    position: 'relative',
    margin: '10px',
  };

  const ringStyle = {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: `${size}`,
    height: `${size}`,
    backgroundColor: loading ? 'transparent' : color,
    border: '5px solid',
    borderColor: loading ? `${color} ${color} ${color} transparent` : `${color}`,
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    boxSizing: 'border-box',
    animation: loading ? 'spin 2s linear infinite' : 'none',
  };

  const keyframes = `
    @keyframes spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
    }
  `;

  return (
    <>
      <style>{keyframes}</style>
      <div style={containerStyle}>
        <div style={ringStyle} />
      </div>
    </>
  );
};

export default Beacon;

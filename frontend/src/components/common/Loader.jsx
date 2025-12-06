import React from 'react';

const Loader = ({ size = 'md', className = '' }) => {
    const sizeClass = size !== 'md' ? `loader-${size}` : '';
    const classes = ['loader', sizeClass, className].filter(Boolean).join(' ');

    return (
        <div className="flex justify-center items-center p-4">
            <div className={classes}></div>
        </div>
    );
};

export default Loader;

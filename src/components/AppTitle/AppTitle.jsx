import React from 'react';

const AppTitle = ({ icon, label }) => {
    return (
        <>
            <div className='text-center'>
                <img src={icon} alt="" className='h-7 mx-auto mt-3 mb-1.5' />
                <h1 className='text-xl sm:text-2xl font-black font-blickb mb-3 sm:mb-4'>{label}</h1>
            </div>
        </>
    );
};

export default AppTitle;
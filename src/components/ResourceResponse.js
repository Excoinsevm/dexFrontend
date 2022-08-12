import React from 'react'
import { TbFaceIdError as NotFoundIcon } from 'react-icons/tb'
import LoadingOverlayer from './LoadingOverlayer'
// import { IoTimer as TimeoutIcon } from 'react-icons/io'

const ResourceResponse = ({ resName, status }) => {
  if (status === 'loading') return (
    <div className='flex flex-col justify-center items-center mt-32 text-c-minor'>
      <LoadingOverlayer open size='w-32 h-32' />
      {/* <div className='mt-4 text-xl'>Loading ...</div> */}
    </div>
  )
  else if (status === 'timeout') return (
    <div className='flex flex-col justify-center items-center mt-32 text-c-minor'>
      <NotFoundIcon className='w-20 h-20 text-6xl' />
      <div className='mt-4 text-xl'>No response, please try again later</div>
    </div>
  )
  else if (status === 'notfound') return (
    <div className='flex flex-col justify-center items-center mt-32 text-c-minor'>
      <NotFoundIcon className='w-20 h-20 text-6xl' />
      <div className='mt-4 text-xl'>{resName} does not exist</div>
    </div>
  )
}

export default ResourceResponse
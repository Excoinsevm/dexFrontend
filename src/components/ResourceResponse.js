import React from 'react'
import { TbFaceIdError as NotFoundIcon } from 'react-icons/tb'
import LoadingOverlayer from './LoadingOverlayer'
// import { IoTimer as TimeoutIcon } from 'react-icons/io'

const ResourceResponse = ({ resName, status, style, iconSize }) => {
  const _style = `flex flex-col justify-center items-center mt-32 text-c-minor ${style}`
  if (status === 'loading') return (
    <div className={_style}>
      <LoadingOverlayer open size={`w-32 h-32 ${iconSize}`} />
      {/* <div className='mt-4 text-xl'>Loading ...</div> */}
    </div>
  )
  else if (status === 'timeout') return (
    <div className={_style}>
      <NotFoundIcon className='w-20 h-20 text-6xl' />
      <div className='mt-4 text-xl'>No response, please try again later</div>
    </div>
  )
  else if (status === 'notfound') return (
    <div className={_style}>
      <NotFoundIcon className='w-20 h-20 text-6xl' />
      <div className='mt-4 text-xl'>{resName} does not exist</div>
    </div>
  )
}

export default ResourceResponse
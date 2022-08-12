import React, { useEffect, useState } from 'react'
import Modal from './Modal'
import { AiOutlineClose as CloseIcon } from 'react-icons/ai'
import AdminOperation from './AdminOperation'

const AdminOperationModal = ({ operation, openct }) => {

  const [open, setOpen] = useState(true)

  useEffect(() => {
    setOpen(true)
  }, [openct])

  const updateProgress = (ps) => {
    if (ps === 201) {
      setOpen(false)
    }
    else if (ps === 200) {
      setTimeout(() => { setOpen(false) }, 1000)
    }
    else if (ps > 0) {
    }
  }

  return (
    <div>
      <Modal open={open} onClickOutside={() => { setOpen(false) }}>
        <div className='flex flex-col justify-center items-center min-w-[20em] mx-6 my-6'>
          <div className='relative flex flex-row justify-center items-center w-full px-[6.3em] pb-3 whitespace-nowrap bg-green-3 
                          text-left select-none'>
            <div className={`w-48 px-4 py-2 rounded-lg border-2 border-c-weak bg-c-btn saturate-[60%] text-center`}>
              {operation.title}
            </div>
            <div className='absolute right-0 flex justify-end items-center'>
              <CloseIcon className='w-6 h-6 text-c-major cursor-pointer hover:text-c-tab'
                onClick={() => { setOpen(false) }} />
            </div>
          </div>
          <div className='h-[24rem] flex flex-col justify-end bg-green-800'>
            <AdminOperation operation={operation} onProgressUpdate={updateProgress} />
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default AdminOperationModal
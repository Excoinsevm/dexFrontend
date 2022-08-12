import React from 'react'

const Page = ({ pageContent }) => {
  return (
    <div className="flex justify-center items-cente pt-10">
      <h1 className="text-5xl uppercase font-bold">
        {pageContent}
      </h1>
    </div>
  )
}

export default Page
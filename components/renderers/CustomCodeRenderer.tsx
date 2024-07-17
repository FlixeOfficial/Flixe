'use client'

function CustomCodeRenderer({ data }: any) {
  (data)

  return (
    <pre className='bg-card/90 rounded-md p-4'>
      <code className='text-primary text-sm'>{data.code}</code>
    </pre>
  )
}

export default CustomCodeRenderer

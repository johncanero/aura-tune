import Header from "@/components/Header";
import ListItem from "@/components/ListItem";

export default function Home() {
  return (
    <div className='bg-neutral-900 rounded-lg h-full overflow-hidden overflow-y-auto md:mr-2'>
      <Header>
        {/* Welcome Back */}
        <div className='mb-2'>
          <h1 className='text-white text-3xl font-semibold'>Welcome Back</h1>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3 mt-4'>
          <ListItem
            image='/images/liked.png'
            name='Favorites'
            href='favorites'
          />
        </div>
      </Header>

      <div className='mt-2 mb-7 px-6'>
        <div className='flex justify-between items-center '>
          <h1 className='text-white text-2xl font-semibold'>Newest Songs</h1>
        </div>

        <div>
          List of Songs
        </div>
      </div>
    </div>
  )
}

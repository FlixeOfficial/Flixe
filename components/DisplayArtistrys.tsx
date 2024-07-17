import React from 'react';
import ArtCard from './art-card';
// import { loader } from '../assets';

interface Props {
  isLoading: boolean;
  artistrys: any[];
}

const DisplayArtistrys: React.FC<Props> = ({ isLoading, artistrys }) => {
  return (
    <div>
      {!isLoading && artistrys.length === 0 && (
        <div className="text-center text-sm text-muted-foreground mt-10">
          No flixs found
        </div>
      )}

      <div className="mt-2 grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
        {artistrys.map((art, index) => (
          <ArtCard key={index} {...art} id={index} />
        ))}
      </div>
    </div>
  );``
};

export default DisplayArtistrys;
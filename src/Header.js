import React from 'react';
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="bg-green-700 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold cursor-pointer"
          onClick={() => navigate('/')}
        >
          에스랩 강남 4호점 유틸
        </h1>

        <div className="text-sm md:text-base flex items-center space-x-2">
          <MapPin className="text-green-400" />
          <p className="bg-green-600 text-white px-3 py-1 rounded-full">
            강남4호점
          </p>
        </div>

        <nav className="hidden md:block">
          <ul className="flex space-x-4">
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;

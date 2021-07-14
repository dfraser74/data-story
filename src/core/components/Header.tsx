import React, { FC } from 'react';
import * as globalWindow from '../types/globalWindow'

const Header: FC = () => {
  return (
    <div className="w-full">
      <div className="w-full p-4 bg-gray-700 shadow shadow-lg">
        <span className="text-xl text-malibu-500 font-mono">
          {window.config.appName}
          <span className="ml-4 text-sm text-gray-400">
            {window.config.appDesc}
          </span>
        </span>
      </div>
    </div>
  );
};

export default Header;

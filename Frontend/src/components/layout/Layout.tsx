import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="flex min-h-screen overflow-x-hidden w-full">
      <Sidebar />
      <main className="flex-1 w-full lg:ml-64 overflow-x-hidden">
        <div className="w-full max-w-full overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
import { Route, Routes } from 'react-router-dom';
import { Home } from './pages/Home';
import { Navbar } from './components/Navbar';
import { ProfilePage } from './pages/ProfilePage';
import { CreateListPage } from './pages/CreateListPage';
import { PublicListsPage } from './pages/PublicListsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ToastContainer } from 'react-toastify';
import { UserListsPage } from './pages/UserListsPage';
import { PublicProfilePage } from './pages/PubblicProfilePage';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  return (
  <div className='min-h-screen bg-black text-gray-100 transition-opacity duration-700 pt-20'>
    <Navbar />
    <div className='container mx-auto px-4 py-6'>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile/:id" element={<ProfilePage />} />
        <Route path="/list/create" element={<CreateListPage />} />
        <Route path="/lists" element={<PublicListsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/my-lists/:id" element={<UserListsPage />} />
        <Route path="/detail/profile/:profileId" element={<PublicProfilePage />} />
      </Routes>
      <ToastContainer
        
      />
    </div>
  </div>
  );
}

export default App;

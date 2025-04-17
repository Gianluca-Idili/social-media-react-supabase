import { Route, Routes } from 'react-router';
import { Home } from './pages/Home';
import { Navbar } from './components/Navbar';
import { ProfilePage } from './pages/ProfilePage';
import { CreateListPage } from './pages/CreateListPage';
import { PublicListsPage } from './pages/PublicListsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserListsPage } from './pages/UserListsPage';


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
      </Routes>
      <ToastContainer
        
      />
    </div>
  </div>
  );
}

export default App;

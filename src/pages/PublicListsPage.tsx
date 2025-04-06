import { PublicListsContainer } from "../components/publicLists/PublicListsContainer";



export const PublicListsPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
        Community Lists
      </h1>
      <PublicListsContainer />
    </div>
  );
};
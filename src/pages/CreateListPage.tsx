import { TaskItem } from "../components/taskLists/TaskItem";


export const CreateListPage = () => {
  return (
    <div className="pt-10">
      <h2 className="text-4xl pb-10 sm:text-5xl md:text-6xl font-bold mb-8 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
          Crea una Lista 
        </h2>
      <TaskItem />
    </div>
  );
};
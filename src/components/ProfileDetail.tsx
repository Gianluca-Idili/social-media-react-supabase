import { useEffect, useState } from "react";
import { supabase } from "../supabase-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ProfileItem } from "./ProfileItem";
import { CreateListButton } from "./CreateListButton";

export interface Profile {
  id: string; // Modificato da number a string (UUID)
  username: string;
  email: string;
  created_at: string;
}

interface Props {
  profileId: string; // Modificato da number a string
}

const fetchProfileById = async (id: string): Promise<Profile> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as Profile;
};

export const ProfileDetail = ({ profileId }: Props) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
  });

  const { data, error, isPending } = useQuery<Profile, Error>({
    queryKey: ["profile", profileId],
    queryFn: () => fetchProfileById(profileId),
  });

  useEffect(() => {
    console.log("Profile data:", data);
    if (data) {
      setFormData({
        username: data.username || "",
        email: data.email || "",
      });
    }
  }, [data]);

  const updateProfile = useMutation({
    mutationFn: async (updatedData: Partial<Profile>) => {
      const { error } = await supabase
        .from("profiles")
        .update(updatedData)
        .eq("id", profileId);

      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["profile", profileId],
      });
      setIsEditing(false);
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  if (isPending)
    return <div className="text-center py-8">Caricamento profilo...</div>;
  if (error)
    return (
      <div className="text-center py-8 text-red-400">
        Errore: {error.message}
      </div>
    );

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 mb-2">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 rounded"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 bg-gray-800 rounded"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
              disabled={updateProfile.isPending}
            >
              {updateProfile.isPending ? "Salvataggio..." : "Salva"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
            >
              Annulla
            </button>
          </div>
        </form>
      ) : (
        <>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent break-words overflow-hidden">
            Profilo di {data?.username || "Non hai un username"} =D
          </h2>

          <div>
            <ProfileItem
              username={data?.username || ""}
              email={data?.email || ""}
              createdAt={data?.created_at || ""}
              onEdit={() => setIsEditing(true)}
            />
          </div>
          <div>
            <CreateListButton />
          </div>
        </>
      )}
    </div>
  );
};

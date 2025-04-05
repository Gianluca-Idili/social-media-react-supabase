import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../supabase-client";

interface ProfileFormProps {
  profileId: string;
  initialData: {
    username: string;
    email: string;
  };
  onSuccess: () => void; // Modificato da onCancel a onSuccess
}

export const ProfileForm = ({ profileId, initialData, onSuccess }: ProfileFormProps) => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(initialData);

  const updateProfile = useMutation({
    mutationFn: async (updatedData: { username: string; email: string }) => {
      const { data, error } = await supabase
        .from("profiles")
        .update(updatedData)
        .eq("id", profileId)
        .select()
        .single(); // Aggiunto .select().single()

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (updatedData) => {
      // 1. Aggiorna la cache con i nuovi dati
      queryClient.setQueryData(["profile", profileId], updatedData);
      // 2. Chiudi la modalità di editing (tramite callback)
      onSuccess();
    }
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

  return (
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
          onClick={onSuccess} // Usa lo stesso callback per annullare
          className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded"
        >
          Annulla
        </button>
      </div>
    </form>
  );
};
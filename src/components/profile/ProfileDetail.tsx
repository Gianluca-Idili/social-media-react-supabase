import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { supabase } from "../../supabase-client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ProfileItem } from "./ProfileItem";
import { CreateListButton } from "./CreateListButton";
import { ProfileForm } from "./ProfileForm";
import { CardList } from "../taskLists/CardList";
import { useLocation } from "react-router";

export interface Profile {
  id: string;
  username: string;
  email: string;
  points: number;
  created_at: string;
}

interface Props {
  profileId: string;
}

interface Task {
  id: string;
  list_id: string;
  description: string;
  is_completed: boolean;
  created_at?: string;
}

interface ListWithTasks {
  id: string;
  user_id: string;
  title: string;
  type: string;
  is_completed: boolean;
  is_public: boolean;
  reward?: string | null;
  punishment?: string | null;
  completed_at?: string | null;
  expires_at?: string | null;
  created_at: string;
  tasks: Task[];
}

const calculatePoints = (listType: string, isPublic: boolean): number => {
  const basePoints =
    {
      daily: 10,
      weekly: 30,
      monthly: 100,
    }[listType] || 0;

  return isPublic ? basePoints : Math.floor(basePoints / 2);
};

const fetchProfileById = async (id: string): Promise<Profile> => {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as Profile;
};

const fetchListsWithTasks = async (userId: string) => {
  const { data, error } = await supabase
    .from("lists")
    .select(
      `
      id,
      user_id,
      title,
      type,
      is_completed,
      is_public,
      reward,
      punishment,
      completed_at,
      expires_at,
      created_at,
      tasks: tasks(
        id,
        list_id,
        description,
        is_completed
      )
    `
    )
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase error:", error);
    throw new Error(error.message);
  }

  return data as ListWithTasks[];
};

export const ProfileDetail = ({ profileId }: Props) => {
  const location = useLocation();
  
  const [hiddenLists, setHiddenLists] = useState<string[]>([]);

  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const toastId = React.useRef<string | number | null>(null); // <-- Qui il fix

  useEffect(() => {
    if (location.state?.showToast) {
      if (!toastId.current || !toast.isActive(toastId.current)) {
        toastId.current = toast.success( 
          <span className="gradient-text">Lista creata con successo!</span>);
        window.history.replaceState({}, '');
      }
    }
  }, [location.state]);

  const {
    data: profileData,
    error: profileError,
    isPending: isProfilePending,
  } = useQuery<Profile, Error>({
    queryKey: ["profile", profileId],
    queryFn: () => fetchProfileById(profileId),
  });

  const {
    data: lists,
    error: listsError,
    isLoading: isLoadingLists,
  } = useQuery({
    queryKey: ["userLists", profileId],
    queryFn: () => fetchListsWithTasks(profileId),
    enabled: !!profileId,
  });

  if (isProfilePending)
    return <div className="text-center py-8">Caricamento profilo...</div>;

  if (profileError)
    return (
      <div className="text-center py-8 text-red-400">
        Errore: {profileError.message}
      </div>
    );

  if (!profileData)
    return (
      <div className="text-center py-8">Nessun dato del profilo trovato</div>
    );

  const isListCompletedOrExpired = (list: ListWithTasks): boolean => {
    if (list.is_completed) {
      return true;
    }

    if (list.expires_at) {
      const now = new Date();
      const expiresAt = new Date(list.expires_at);
      return now >= expiresAt;
    }

    return false;
  };

  const handleMakePublic = async (listId: string) => {
    try {
      const list = lists?.find((l) => l.id === listId);
      if (!list) return;

      const updates = [
        supabase.from("lists").update({ is_public: true }).eq("id", listId),
      ];

      // Aggiungi punti solo se completata
      if (list.is_completed) {
        const pointsToAdd = calculatePoints(list.type, true);
        updates.push(
          supabase
            .from("profiles")
            .update({ points: (profileData?.points || 0) + pointsToAdd })
            .eq("id", profileId)
        );
        toast.success(
        <span className="gradient-text">Lista completata è Pubblica! <br/> + {pointsToAdd} punti !</span>);
      }

      const results = await Promise.all(updates);
      const errors = results.map((r) => r.error).filter(Boolean);

      if (errors.length > 0) throw errors[0];

      setHiddenLists((prev) => [...prev, listId]);
      await queryClient.invalidateQueries({
        queryKey: ["userLists", profileId],
      });
      await queryClient.invalidateQueries({ queryKey: ["profile", profileId] });
    } catch (error) {
      console.error("Errore:", error);
      alert("Operazione fallita");
    }
  };

  const handleHideList = async (listId: string) => {
    try {
      const list = lists?.find((l) => l.id === listId);
      if (!list || !list.is_completed) {
        setHiddenLists((prev) => [...prev, listId]);
        return;
      }

      const pointsToAdd = calculatePoints(list.type, false);

      const { error } = await supabase
        .from("profiles")
        .update({ points: (profileData?.points || 0) + pointsToAdd })
        .eq("id", profileId);

      if (error) throw error;
      toast.success(
        <span className="gradient-text">Lista completata è Nascosta! <br/> + {pointsToAdd} punti !</span>
      );
      setHiddenLists((prev) => [...prev, listId]);
      await queryClient.invalidateQueries({ queryKey: ["profile", profileId] });
    } catch (error) {
      console.error("Errore aggiornamento punti:", error);
    }
  };

  // Filtriamo le liste per mostrare solo:
  // 1. Liste non completate/non scadute
  // 2. Liste completate/scadute ma non ancora gestite (non nascoste e non pubbliche)
  const filteredLists =
    lists?.filter(
      (list) =>
        !hiddenLists.includes(list.id) &&
        (!isListCompletedOrExpired(list) ||
          (isListCompletedOrExpired(list) && !list.is_public))
    ) || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4">
      {isEditing ? (
        <ProfileForm
          profileId={profileId}
          initialData={{
            username: profileData?.username || "",
            email: profileData?.email || "",
          }}
          onSuccess={() => setIsEditing(false)}
        />
      ) : (
        <>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent break-words overflow-hidden">
            Profilo di {profileData?.username || "Non hai un username"} =D
          </h2>

          <div>
            <ProfileItem
              username={profileData?.username || ""}
              email={profileData?.email || ""}
              points={profileData?.points || 0}
              createdAt={profileData?.created_at || ""}
              onEdit={() => setIsEditing(true)}
            />
          </div>

          <div className="mt-10 space-y-6">
            <div>
              <CreateListButton />
            </div>

            <h3 className="text-2xl text-center md:text-3xl font-medium bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent mb-6">
              Le Tue Liste
            </h3>

            {isLoadingLists ? (
              <div className="text-center py-4">Caricamento liste...</div>
            ) : listsError ? (
              <div className="text-center py-4 text-red-400">
                Errore nel caricamento liste
              </div>
            ) : filteredLists.length > 0 ? (
              filteredLists.map((list) => {
                if (isListCompletedOrExpired(list) && !list.is_public) {
                  return (
                    <div key={list.id} className="space-y-4">
                      <CardList list={list} />
                      <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg border border-gray-700 text-center">
                        <p className="text-gray-300 mb-4">
                          La lista "{list.title}" è{" "}
                          {list.is_completed ? "completata" : "scaduta"}.
                          Desideri renderla pubblica?
                        </p>
                        <div className="flex justify-center gap-4">
                          <button
                            onClick={() => handleMakePublic(list.id)}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-md hover:from-purple-600 hover:to-pink-600 transition-colors"
                          >
                            Rendi pubblica
                          </button>
                          <button
                            onClick={() => handleHideList(list.id)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                          >
                            Nascondi
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                } else {
                  return <CardList key={list.id} list={list} />;
                }
              })
            ) : (
              <div className="text-center py-10">
                <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg border border-gray-700">
                  <p className="text-gray-300 mb-3">🎯</p>
                  <h4 className="text-lg font-medium text-gray-200">
                    {lists && lists.length > 0
                      ? "Tutte le liste completate sono state gestite"
                      : "Nessuna lista creata ancora"}
                  </h4>
                  <p className="text-gray-400 mt-1">
                    {lists && lists.length > 0
                      ? "Crea una nuova lista per continuare!"
                      : "Crea la tua prima lista per iniziare a organizzare i task!"}
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

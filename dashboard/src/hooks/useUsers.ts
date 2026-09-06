import { useState, useEffect } from "react";
import type { User, CreateUserRequest } from "../types";
import { getUsers, createUser } from "../api/users.service";
import { getApiErrorMessage } from "../api/client";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [addUserSuccess, setAddUserSuccess] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);
  function loadUsers() {
    setLoading(true);
    getUsers()
      .then((data) => setUsers(data))
      .catch((error) => setError(getApiErrorMessage(error)))
      .finally(() => setLoading(false));
  }

  function addUser(userData: CreateUserRequest, onSuccess?: () => void) {
    setAddUserError(null);
    setAddUserLoading(true);

    createUser(userData)
      .then(() => {
        loadUsers();
        setAddUserSuccess(true);
        setTimeout(() => setAddUserSuccess(false), 3000);
        onSuccess?.();
      })
      .catch((error) => {
        setAddUserError(getApiErrorMessage(error));
      })
      .finally(() => {
        setAddUserLoading(false);
      });
  }
  return {
    users,
    loading,
    error,
    addUserLoading,
    addUserError,
    addUser,
    addUserSuccess,
  };
}

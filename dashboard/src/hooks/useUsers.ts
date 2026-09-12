import { useState, useEffect } from "react";
import type { User, CreateUserRequest, UserStatus } from "../types";
import {
  getUsers,
  createUser,
  updateUserStatus,
  resetUserPassword,
  deleteUser as deleteUserRequest,
} from "../api/users.service";
import { getApiErrorMessage } from "../api/client";

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addUserLoading, setAddUserLoading] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);
  const [addUserSuccess, setAddUserSuccess] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isActionPending, setIsActionPending] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);
  function loadUsers() {
    setLoading(true);
    return getUsers()
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

// Optimistic status toggle backed by PATCH /users/:id/status. On failure the
// row is reverted to its previous state so the UI never lies about the
// backend. Returns true when the backend accepted the change.
  async function setUserStatus(id: string, status: UserStatus) {
    if (!id) {
      setActionError("Missing user id — cannot update this user.");
      return false;
    }

    const previous = users.find((user) => user.id === id)?.status;

    setActionError(null);
    setIsActionPending(true);
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, status } : user)),
    );

    try {
      await updateUserStatus(id, status);
      return true;
    } catch (statusError) {
      setActionError(getApiErrorMessage(statusError));
      setUsers((prev) =>
        prev.map((user) =>
          user.id === id ? { ...user, status: previous ?? user.status } : user,
        ),
      );
      return false;
    } finally {
      setIsActionPending(false);
    }
  }

  // PATCH /users/:id/reset-password then refresh so the list reflects reality.
  async function resetPassword(id: string, newPassword: string) {
    if (!id) {
      setActionError("Missing user id — cannot reset this user's password.");
      return false;
    }

    setActionError(null);
    setIsActionPending(true);

    try {
      await resetUserPassword(id, newPassword);
      await loadUsers();
      return true;
    } catch (passwordError) {
      setActionError(getApiErrorMessage(passwordError));
      return false;
    } finally {
      setIsActionPending(false);
    }
  }

  // DELETE /users/:id. Optimistically removes the row and restores it (at its
  // original position) if the backend rejects, so a failed delete never leaves
  // a user silently missing from the registry.
  async function deleteUser(id: string) {
    if (!id) {
      setActionError("Missing user id — cannot delete this user.");
      return false;
    }

    const index = users.findIndex((user) => user.id === id);
    const previous = index >= 0 ? users[index] : null;

    setActionError(null);
    setIsActionPending(true);
    setUsers((prev) => prev.filter((user) => user.id !== id));

    try {
      await deleteUserRequest(id);
      await loadUsers();
      return true;
    } catch (deleteError) {
      setActionError(getApiErrorMessage(deleteError));

      if (previous) {
        setUsers((prev) => {
          if (prev.some((user) => user.id === id)) return prev;
          const next = [...prev];
          next.splice(Math.min(index, next.length), 0, previous);
          return next;
        });
      }

      return false;
    } finally {
      setIsActionPending(false);
    }
  }

  // TEMPORARY frontend-only mutation (no API call).
  // Replaced by PATCH /users/:id when the backend supports editing/status changes.
  function updateUserLocal(
    id: string,
    patch: Partial<Pick<User, "name" | "employeeCode" | "role" | "status">>,
  ) {
    if (!id) return;
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, ...patch } : user)),
    );
  }

  function clearActionError() {
    setActionError(null);
  }

  return {
    users,
    loading,
    error,
    addUserLoading,
    addUserError,
    addUser,
    addUserSuccess,
    setUserStatus,
    resetPassword,
    deleteUser,
    actionError,
    clearActionError,
    isActionPending,
    updateUserLocal,
  };
}
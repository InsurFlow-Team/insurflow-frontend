import { useEffect, useMemo, useState } from "react";
import type { CreateUserRequest, Role, User, UserStatus } from "../types";
import { useForm } from "../hooks/useForm";
import {
  validateEmployeeCode,
  validateName,
  validatePassword,
  validateRole,
} from "../utils/validation";
import { getUserStatus } from "../utils/user";
import DataTable from "../components/ui/DataTable";
import Pagination from "../components/ui/Pagination";
import Modal from "../components/ui/Modal";
import ConfirmDialog from "../components/ui/ConfirmDialog";
import CreateUserModal from "../components/users/CreateUserModal";
import EditUserForm from "../components/users/EditUserForm";
import ResetPasswordModal from "../components/users/ResetPasswordModal";
import UserFilterBar from "../components/users/UserFilterBar";
import UserStats from "../components/users/UserStats";
import UsersPageHeader from "../components/users/UsersPageHeader";
import { buildUserColumns } from "../components/users/usersColumns";
import { computeUserStats } from "../components/users/usersStats";
import { useUserFilters, ROWS_PER_PAGE_OPTIONS } from "../hooks/useUserFilters";
import { useUsers } from "../hooks/useUsers";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "../contexts/ToastContext";

export default function Users() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === "ADMIN";

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDeactivate, setUserToDeactivate] = useState<User | null>(null);
  const [userToReset, setUserToReset] = useState<User | null>(null);

  const {
    users,
    loading,
    error,
    addUser,
    addUserLoading,
    addUserError,
    addUserSuccess,
    setUserStatus,
    resetPassword,
    actionError,
    isActionPending,
    updateUserLocal,
  } = useUsers();

  const filters = useUserFilters(users);

  useEffect(() => {
    if (addUserSuccess) {
      toast("success", "User created successfully.");
    }
  }, [addUserSuccess]);

  useEffect(() => {
    if (actionError) {
      toast("error", actionError);
    }
  }, [actionError]);

  const { values, errors, handleChange, isValid, reset } = useForm<{
    name: string;
    employeeCode: string;
    password: string;
    role: Role | "";
  }>(
    {
      name: "",
      employeeCode: "",
      password: "",
      role: "",
    },
    {
      name: validateName,
      employeeCode: validateEmployeeCode,
      password: validatePassword,
      role: validateRole,
    },
  );

  const stats = useMemo(() => computeUserStats(users), [users]);

  const handleClose = () => {
    setIsModalOpen(false);
    reset();
  };

  const handleSubmit = () => {
    addUser(
      {
        name: values.name,
        employeeCode: values.employeeCode,
        password: values.password,
        role: values.role as CreateUserRequest["role"],
      },
      handleClose,
    );
  };

  // Activating needs no confirmation. Deactivating is guarded by ConfirmDialog
  // (see userToDeactivate) because it locks the account out.
  async function handleToggleStatus(user: User) {
    if (getUserStatus(user) === "ACTIVE") {
      setUserToDeactivate(user);
    } else {
      await setUserStatus(user.id, "ACTIVE");
    }
  }

  async function handleDeactivateConfirm() {
    if (!userToDeactivate) return;
    const user = userToDeactivate;
    await setUserStatus(user.id, "INACTIVE");
    setUserToDeactivate(null);
  }

  async function handleEditSave(patch: {
    name: string;
    employeeCode: string;
    role: Role;
    status: UserStatus;
  }) {
    if (editingUser) {
      updateUserLocal(editingUser.id, patch);
    }
    setEditingUser(null);
  }

  const columns = buildUserColumns({
    onEdit: setEditingUser,
    onReset: setUserToReset,
    onToggleStatus: (user) => void handleToggleStatus(user),
    disabled: isActionPending,
    currentUserId: currentUser?.id,
  });

  const tableFooter = (
    <Pagination
      currentPage={filters.page}
      totalPages={filters.totalPages}
      rowsPerPage={filters.rowsPerPage}
      rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
      onPageChange={filters.onPageChange}
      onRowsPerPageChange={filters.onRowsPerPageChange}
    />
  );

  return (
    <div className="space-y-6">
      <UsersPageHeader
        isAdmin={isAdmin}
        onAddUser={() => setIsModalOpen(true)}
      />

      <UserStats stats={stats} />

      <UserFilterBar
        search={filters.search}
        roleFilter={filters.roleFilter}
        statusFilter={filters.statusFilter}
        filteredCount={filters.filteredCount}
        totalCount={users.length}
        onSearchChange={filters.onSearchChange}
        onRoleChange={filters.onRoleChange}
        onStatusChange={filters.onStatusChange}
        onReset={filters.onResetFilters}
      />

      <DataTable
        columns={columns}
        data={filters.pagedUsers}
        loading={loading}
        error={error ?? undefined}
        emptyMessage="No users found."
        keyExtractor={(user) => user.id}
        footer={tableFooter}
      />

      {/* Create User modal */}
      <CreateUserModal
        isOpen={isModalOpen}
        values={values}
        errors={errors}
        isValid={isValid}
        loading={addUserLoading}
        error={addUserError ?? undefined}
        onChange={handleChange}
        onCancel={handleClose}
        onSubmit={handleSubmit}
      />

      {/* Edit User modal (TEMPORARY frontend-only — no backend endpoint yet) */}
      <Modal
        isOpen={editingUser !== null}
        onClose={() => setEditingUser(null)}
        title="Edit User"
      >
        {editingUser && (
          <EditUserForm
            user={editingUser}
            onCancel={() => setEditingUser(null)}
            onSave={handleEditSave}
          />
        )}
      </Modal>

      {/* Deactivate confirmation */}
      <ConfirmDialog
        isOpen={userToDeactivate !== null}
        title="Deactivate User"
        confirmLabel="Deactivate"
        loading={isActionPending}
        onCancel={() => setUserToDeactivate(null)}
        onConfirm={handleDeactivateConfirm}
      >
        {userToDeactivate && (
          <p className="text-sm text-text-muted">
            <span className="font-medium text-text">
              {userToDeactivate.name}
            </span>{" "}
            ({userToDeactivate.employeeCode}) will no longer be able to sign in.
            You can reactivate them at any time.
          </p>
        )}
      </ConfirmDialog>

      {/* Reset Password modal */}
      <ResetPasswordModal
        user={userToReset}
        onClose={() => setUserToReset(null)}
        onSubmit={resetPassword}
      />
    </div>
  );
}
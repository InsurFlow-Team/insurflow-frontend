import { useMemo, useState } from "react";
import type { Role, User, UserStatus } from "../types";
import { getUserStatus } from "../utils/user";
import { ROWS_PER_PAGE_OPTIONS } from "../utils/claims";

export { ROWS_PER_PAGE_OPTIONS };

interface FilterState {
  search: string;
  roleFilter: Role | "";
  statusFilter: UserStatus | "";
}

function filterUsers(users: User[], filters: FilterState): User[] {
  const query = filters.search.trim().toLowerCase();

  return users.filter((user) => {
    const matchesSearch =
      !query ||
      `${user.name} ${user.employeeCode}`.toLowerCase().includes(query);
    const matchesRole = !filters.roleFilter || user.role === filters.roleFilter;
    const matchesStatus =
      !filters.statusFilter || getUserStatus(user) === filters.statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });
}

export function useUserFilters(users: User[]) {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [statusFilter, setStatusFilter] = useState<UserStatus | "">("");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [page, setPage] = useState(1);

  const filteredUsers = useMemo(
    () => filterUsers(users, { search, roleFilter, statusFilter }),
    [users, search, roleFilter, statusFilter],
  );

  const totalPages = Math.max(
    1,
    Math.ceil(filteredUsers.length / rowsPerPage),
  );
  const currentPage = Math.min(page, totalPages);

  const pagedUsers = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredUsers.slice(start, start + rowsPerPage);
  }, [filteredUsers, currentPage, rowsPerPage]);

  const reset = () => {
    setSearch("");
    setRoleFilter("");
    setStatusFilter("");
    setPage(1);
  };

  const changePage = (value: number) => setPage(value);
  const changeRowsPerPage = (rows: number) => {
    setRowsPerPage(rows);
    setPage(1);
  };

  return {
    search,
    roleFilter,
    statusFilter,
    rowsPerPage,
    page: currentPage,
    totalPages,
    filteredCount: filteredUsers.length,
    pagedUsers,
    onSearchChange: (value: string) => {
      setSearch(value);
      setPage(1);
    },
    onRoleChange: (value: Role | "") => {
      setRoleFilter(value);
      setPage(1);
    },
    onStatusChange: (value: UserStatus | "") => {
      setStatusFilter(value);
      setPage(1);
    },
    onResetFilters: reset,
    onPageChange: changePage,
    onRowsPerPageChange: changeRowsPerPage,
  };
}
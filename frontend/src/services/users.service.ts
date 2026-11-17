import { api } from '@/services/http/client';
import { unwrapEnvelope } from '@/lib/http';
import type {
  AdminUserListItem,
  ListUsersQuery,
  Paginated,
  ServiceRequestOptions,
  UserProfile,
  UserStatus,
} from '@/types';

export function getMe(options?: ServiceRequestOptions): Promise<UserProfile> {
  return api
    .get('/users/me', { signal: options?.signal })
    .then((response) => unwrapEnvelope(response.data));
}

export function updateMe(
  input: { fullName?: string },
  options?: ServiceRequestOptions,
): Promise<UserProfile> {
  return api
    .patch('/users/me', input, { signal: options?.signal })
    .then((response) => unwrapEnvelope(response.data));
}

export function getUser(id: string, options?: ServiceRequestOptions): Promise<UserProfile> {
  return api
    .get(`/users/${id}`, { signal: options?.signal })
    .then((response) => unwrapEnvelope(response.data));
}

export function updateUserStatus(
  id: string,
  status: UserStatus,
  options?: ServiceRequestOptions,
): Promise<AdminUserListItem> {
  return api
    .patch(`/users/${id}/status`, { status }, { signal: options?.signal })
    .then((response) => unwrapEnvelope(response.data));
}

export function deleteUser(
  id: string,
  options?: ServiceRequestOptions,
): Promise<{ message: string }> {
  return api
    .delete(`/users/${id}`, { signal: options?.signal })
    .then((response) => unwrapEnvelope(response.data));
}

export function listUsers(
  query: ListUsersQuery,
  options?: ServiceRequestOptions,
): Promise<Paginated<AdminUserListItem>> {
  return api
    .get('/users', { params: query, signal: options?.signal })
    .then((response) => unwrapEnvelope(response.data));
}

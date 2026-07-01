import type { SessionUser, User } from "./types";
import { SESSION_KEY, USERS_KEY } from "./types";

function getUsers(): User[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUsers(users: User[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

export function saveSession(user: SessionUser): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export function signUp(
  name: string,
  email: string,
  password: string
): { success: boolean; error?: string; user?: SessionUser } {
  const users = getUsers();
  const exists = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim()
  );
  if (exists) {
    return { success: false, error: "An account with this email already exists." };
  }

  const newUser: User = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
  };

  saveUsers([...users, newUser]);

  const sessionUser: SessionUser = {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
  };
  saveSession(sessionUser);

  return { success: true, user: sessionUser };
}

export function updateUser(
  id: string,
  updates: { name?: string; password?: string; currentPassword?: string }
): { success: boolean; error?: string; user?: SessionUser } {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === id);
  if (idx === -1) return { success: false, error: "User not found." };

  let updated = { ...users[idx] };

  if (updates.password) {
    if (updates.currentPassword !== undefined && updated.password !== updates.currentPassword) {
      return { success: false, error: "Current password is incorrect." };
    }
    updated = { ...updated, password: updates.password };
  }

  if (updates.name) {
    updated = { ...updated, name: updates.name.trim() };
  }

  users[idx] = updated;
  saveUsers(users);

  const sessionUser: SessionUser = {
    id: updated.id,
    name: updated.name,
    email: updated.email,
  };
  saveSession(sessionUser);
  return { success: true, user: sessionUser };
}

export function signIn(
  email: string,
  password: string
): { success: boolean; error?: string; user?: SessionUser } {
  const users = getUsers();
  const user = users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim()
  );

  if (!user) {
    return { success: false, error: "No account found with this email." };
  }
  if (user.password !== password) {
    return { success: false, error: "Incorrect password." };
  }

  const sessionUser: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
  };
  saveSession(sessionUser);

  return { success: true, user: sessionUser };
}

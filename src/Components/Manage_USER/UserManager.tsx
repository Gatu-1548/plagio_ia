import React, { useEffect, useState } from "react";
import { createUser, updateUser, getAllUsers,deleteUserByEmail } from "../../Services/authService";
const RoleBadge: React.FC<{ role?: string }> = ({ role }) => {
  const r = (role || "ROLE_USER").toUpperCase();
  const base = "inline-block px-2 py-0.5 text-xs font-medium rounded-full";
  if (r === "ROLE_ADMIN") return <span className={`${base} bg-red-100 text-red-800`}>ADMIN</span>;
  return <span className={`${base} bg-green-100 text-green-800`}>USER</span>;
};

const UserManager: React.FC = () => {
  const [mensaje, setMensaje] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentToken, setCurrentToken] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  // decode JWT payload safely
  const decodePayload = (t?: string | null) => {
    try {
      if (!t) return null;
      const parts = t.split('.');
      if (parts.length < 2) return null;
      const payload = parts[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    const t = sessionStorage.getItem('token');
    const r = sessionStorage.getItem('role');
    setCurrentToken(t);
    setCurrentRole(r);
  }, []);

  // (Los create/update/delete se manejan desde los modales)

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const list = await getAllUsers();
      setUsers(list || []);
    } catch (err) {
      console.error("Error fetch users", err);
      setMensaje("❌ Error al obtener usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // (La selección se maneja con el modal)

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);

  // Campos del modal
  const [mId, setMId] = useState<number | null>(null);
  const [mEmail, setMEmail] = useState("");
  const [mPassword, setMPassword] = useState("");
  const [mRole, setMRole] = useState("USER");
  const [mEnabled, setMEnabled] = useState(true);

  const openCreateModal = () => {
    setModalMode("create");
    setMId(null);
    setMEmail("");
    setMPassword("");
    setMRole("USER");
    setMEnabled(true);
    setModalOpen(true);
  };

  const openEditModal = (u: any) => {
    setModalMode("edit");
    setMId(u.id ?? null);
    setMEmail(u.email || "");
    setMPassword("");
    setMRole(u.role || "USER");
    setMEnabled(!!u.enabled);
    setModalOpen(true);
  };

  const submitModal = async () => {
    if (modalMode === "create") {
      try {
        const res = await createUser(mEmail, mPassword, mRole, mEnabled);
        setMensaje(`✅ Usuario creado: ${res.email}`);
        setModalOpen(false);
        await fetchUsers();
      } catch (err) {
        console.error(err);
        setMensaje("❌ Error al crear usuario");
      }
    } else if (modalMode === "edit") {
      if (!mId) {
        setMensaje("⚠️ ID inválido");
        return;
      }
      try {
        const res = await updateUser(mId, mEmail, mPassword, mRole, mEnabled);
        setMensaje(`✏️ Usuario actualizado: ${res.email}`);
        setModalOpen(false);
        await fetchUsers();
      } catch (err) {
        console.error(err);
        setMensaje("❌ Error al actualizar usuario");
      }
    }
  };

  const openDeleteModal = (u: any) => {
    if (currentRole !== 'ROLE_ADMIN') {
      setMensaje('❌ No tienes permisos para eliminar usuarios. Inicia sesión como ADMIN.');
      return;
    }
    setUserToDelete(u);
    setDeleteModalOpen(true);
  };

 const confirmDelete = async () => {
  if (!userToDelete) return;
  try {
    await deleteUserByEmail(userToDelete.email);
    setMensaje(`🗑️ Usuario eliminado: ${userToDelete.email}`);
    setDeleteModalOpen(false);
    setUserToDelete(null);
    await fetchUsers();
  } catch (err) {
    console.error(err);
    setMensaje(`❌ Error al eliminar usuario: ${(err as Error).message}`);
  }
};

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Usuarios</h2>
        <div className="flex items-center space-x-2">
          <button onClick={openCreateModal} className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Crear usuario</button>
        </div>
      </div>

      {/* Debug: token/role status (temporal) */}
      <div className="mb-4 flex items-center space-x-4 text-sm">
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Rol actual:</span>
          <RoleBadge role={currentRole || undefined} />
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-gray-600">Token:</span>
          {currentToken ? (
            (() => {
              const p = decodePayload(currentToken);
              if (p && p.exp) {
                const expDate = new Date(p.exp * 1000).toLocaleString();
                return <span className="text-green-600">OK (expira: {expDate})</span>;
              }
              return <span className="text-green-600">OK</span>;
            })()
          ) : (
            <span className="text-red-600">No iniciado</span>
          )}
        </div>
        {currentRole !== 'ROLE_ADMIN' && (
          <div className="ml-auto text-xs text-yellow-700">Nota: necesitas rol ADMIN para eliminar usuarios</div>
        )}
      </div>

      {mensaje && <div className="mb-4 p-3 rounded bg-gray-50 border">{mensaje}</div>}

      <div className="bg-white shadow rounded-lg">
        <div className="overflow-auto max-h-96">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">#</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">Rol</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {loading ? (
                <tr><td className="p-4" colSpan={4}>Cargando usuarios...</td></tr>
              ) : users.length === 0 ? (
                <tr><td className="p-4" colSpan={4}>No hay usuarios registrados.</td></tr>
              ) : (
                users.map((u, i) => (
                  <tr key={u.id} className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="px-4 py-3 align-top text-gray-700">{i + 1}</td>
                    <td className="px-4 py-3 align-top text-gray-900">{u.email}</td>
                    <td className="px-4 py-3 align-top"><RoleBadge role={u.role} /></td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => openEditModal(u)} className="mr-2 inline-flex items-center px-3 py-1 bg-yellow-400 text-xs rounded">Editar</button>
                      <button
                        onClick={() => openDeleteModal(u)}
                        disabled={currentRole !== 'ROLE_ADMIN'}
                        className={`inline-flex items-center px-3 py-1 text-xs rounded ${currentRole === 'ROLE_ADMIN' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}
                      >Eliminar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal create/edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setModalOpen(false)} />
          <div className="bg-white rounded-lg shadow-lg z-10 w-full max-w-lg p-6">
            <h3 className="text-lg font-semibold mb-4">{modalMode === 'create' ? 'Crear usuario' : 'Editar usuario'}</h3>

            <div className="mb-3">
              <label className="block text-sm text-gray-700">Email</label>
              <input value={mEmail} onChange={(e) => setMEmail(e.target.value)} className="mt-1 block w-full border rounded p-2" />
            </div>

            <div className="mb-3">
              <label className="block text-sm text-gray-700">Contraseña</label>
              <input type="password" value={mPassword} onChange={(e) => setMPassword(e.target.value)} className="mt-1 block w-full border rounded p-2" placeholder={modalMode === 'edit' ? 'Dejar vacío para no cambiar' : ''} />
            </div>

            <div className="mb-3">
              <label className="block text-sm text-gray-700">Rol</label>
              <select value={mRole} onChange={(e) => setMRole(e.target.value)} className="mt-1 block w-full border rounded p-2">
                <option value="ROLE_USER">USER</option>
                <option value="ROLE_ADMIN">ADMIN</option>
              </select>
            </div>

            <div className="flex items-center mb-4">
              <input id="mEnabled" type="checkbox" checked={mEnabled} onChange={() => setMEnabled(!mEnabled)} className="h-4 w-4" />
              <label htmlFor="mEnabled" className="ml-2 text-sm">Habilitado</label>
            </div>

            <div className="flex justify-end space-x-2">
              <button onClick={() => setModalOpen(false)} className="px-3 py-2 rounded border">Cancelar</button>
              <button onClick={submitModal} className="px-3 py-2 bg-indigo-600 text-white rounded">{modalMode === 'create' ? 'Crear' : 'Guardar'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteModalOpen && userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => setDeleteModalOpen(false)} />
          <div className="bg-white rounded-lg shadow-lg z-10 w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Confirmar eliminación</h3>
            <p className="mb-4">¿Está seguro que desea eliminar al usuario <strong>{userToDelete.email}</strong>? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end space-x-2">
              <button onClick={() => setDeleteModalOpen(false)} className="px-3 py-2 rounded border">Cancelar</button>
              <button onClick={confirmDelete} disabled={currentRole !== 'ROLE_ADMIN'} className={`px-3 py-2 rounded ${currentRole === 'ROLE_ADMIN' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;